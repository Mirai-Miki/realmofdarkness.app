"""
Custom logging handlers for the Realm of Darkness backend.

This module provides a Discord embed logging handler that posts log records
as Discord embeds to a configured channel using a bot token. If sending to
Discord fails for any reason, the handler gracefully falls back to writing
entries to a local log file to preserve observability.

All code is type-annotated and documented to meet strict type-safety and
documentation requirements.
"""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime, timezone
import logging
from logging import Handler, FileHandler, LogRecord
from typing import Any, Dict, Iterable, Optional, Sequence

import json
import textwrap

import requests


class DiscordEmbedHandler(Handler):
    """A logging handler that sends records to a Discord channel as an embed.

    The handler uses Discord's Create Message API with a bot token. When a
    message cannot be delivered (network errors, rate limits, or non-2xx
    responses), the handler writes the record to a fallback file-based handler
    to ensure logs are not lost.

    Parameters
    ----------
    level:
        The minimum logging level for this handler to emit records.
    bot_token:
        The Discord bot token. If not provided or empty, the handler will
        always use the fallback file handler.
    channel_id:
        The Discord channel ID to post messages to. If not provided or empty,
        the handler will always use the fallback file handler.
    fallback_filename:
        Path to the fallback log file to write to when Discord delivery fails.
        If None, a fallback file handler will not be created and errors will be
        handled by logging's default `handleError` behavior.
    timeout_seconds:
        Network timeout (in seconds) for the Discord HTTP request.
    """

    _DISCORD_API_BASE: str = "https://discord.com/api/v10"
    _STANDARD_ATTRS = frozenset(
        {
            "name",
            "msg",
            "args",
            "levelname",
            "levelno",
            "pathname",
            "filename",
            "module",
            "exc_info",
            "exc_text",
            "stack_info",
            "lineno",
            "funcName",
            "created",
            "msecs",
            "relativeCreated",
            "thread",
            "threadName",
            "process",
            "processName",
            "stacklevel",
        }
    )

    def __init__(
        self,
        level: int = logging.NOTSET,
        *,
        bot_token: Optional[str] = None,
        channel_id: Optional[str] = None,
        fallback_filename: Optional[str] = None,
        timeout_seconds: int = 5,
    ) -> None:
        super().__init__(level)
        self._bot_token: Optional[str] = bot_token.strip() if bot_token else None
        self._channel_id: Optional[str] = channel_id.strip() if channel_id else None
        self._timeout: int = int(timeout_seconds)

        self._fallback: Optional[FileHandler]
        if fallback_filename:
            self._fallback = FileHandler(filename=fallback_filename, encoding="utf-8")
        else:
            self._fallback = None

        # Dedicated session for connection reuse
        self._session: requests.Session = requests.Session()

    # ---- Core logging API ----
    def emit(self, record: LogRecord) -> None:  # noqa: D401
        """Emit a log record.

        Attempts to send the record to Discord as an embed. If Discord delivery
        is not configured or fails, writes the record to the fallback file
        handler (when configured). Any errors in fallback handling are passed to
        logging's default error handling via `handleError`.
        """
        try:
            if not self._bot_token or not self._channel_id:
                self._emit_fallback(record)
                return

            payload: Dict[str, Any] = self._build_message_payload(record)
            ok: bool = self._send_to_discord(payload)
            if not ok:
                self._emit_fallback(record)
        except Exception:  # noqa: BLE001 - logging must be resilient
            # If anything unexpected happens, make sure we still log locally
            try:
                self._emit_fallback(record)
            except Exception:
                # Defer to parent error handling (prints traceback once)
                self.handleError(record)

    # ---- Helpers ----
    def _emit_fallback(self, record: LogRecord) -> None:
        """Write the record to the fallback file handler if configured.

        The handler's formatter (if set) is propagated to the fallback so that
        log lines are formatted consistently with the logging configuration.
        """
        if self._fallback is None:
            # No fallback configured; defer to default error handling
            self.handleError(record)
            return

        if self.formatter is not None:
            self._fallback.setFormatter(self.formatter)
        self._fallback.emit(record)

    def _send_to_discord(self, payload: Dict[str, Any]) -> bool:
        """Send the prepared payload to Discord.

        Parameters
        ----------
        payload:
            The JSON-serializable body to send to Discord's Create Message API.

        Returns
        -------
        bool
            True when Discord returns a 2xx response; otherwise False.
        """
        url: str = f"{self._DISCORD_API_BASE}/channels/{self._channel_id}/messages"
        headers: Dict[str, str] = {
            "Authorization": f"Bot {self._bot_token}",
            "Content-Type": "application/json",
            "User-Agent": "RealmOfDarkness/Logger (https://realmofdarkness.app)",
        }
        try:
            # Serialize ourselves to ensure consistent behavior across environments
            body: str = json.dumps(payload, ensure_ascii=False)
            resp: requests.Response = self._session.post(
                url,
                headers=headers,
                data=body.encode("utf-8"),
                timeout=self._timeout,
            )
            if 200 <= resp.status_code < 300:
                return True
            # Consider all non-2xx (including 429) as failure and fall back
            return False
        except requests.RequestException:
            return False

    def _build_message_payload(self, record: LogRecord) -> Dict[str, Any]:
        """Construct the Discord message payload containing a single embed.

        The embed contains the log level, logger name, optional stack trace in
        the description (as a Python-formatted code block), and fields for
        Location, Message, plus any extra fields provided via `extra={...}` in
        logging calls.
        """
        now_iso: str = datetime.now(timezone.utc).isoformat()
        message_text: str = record.getMessage()

        fields: list[Dict[str, Any]] = [
            {
                "name": "Location",
                "value": self._truncate(f"{record.pathname}:{record.lineno}", 1024),
                "inline": False,
            },
            {
                "name": "Message",
                "value": self._truncate(message_text, 1024),
                "inline": False,
            },
        ]

        # Append extra fields from the log record (if any), respecting Discord's 25-field limit
        max_fields: int = 25
        for key, value in self._iter_extra_items(record):
            if len(fields) >= max_fields:
                break
            label: str = (key[:1].upper() + key[1:]) if key else "Extra"
            formatted_value: str = self._format_extra_value(value)
            fields.append(
                {
                    "name": label,
                    "value": self._truncate(formatted_value, 1024),
                    "inline": False,
                }
            )

        embed: Dict[str, Any] = {
            "title": f"{record.levelname} | {record.name}",
            "timestamp": now_iso,
            "color": self._color_for_level(record.levelno),
            "fields": fields,
        }

        exc_text: Optional[str] = self._format_exception(record)
        if exc_text:
            code_block: str = f"```python\n{exc_text}\n```"
            embed["description"] = self._truncate(code_block, 4096)
        else:
            # When no exception, we can optionally include stack_info if present
            if record.stack_info:
                code_block = f"```python\n{record.stack_info}\n```"
                embed["description"] = self._truncate(code_block, 4096)

        payload: Dict[str, Any] = {
            # Everything is in the embed to avoid accidental mentions in content
            "embeds": [embed],
            "allowed_mentions": {"parse": []},
        }
        return payload

    def _format_message(self, record: LogRecord) -> str:
        """Format the main message text for the embed description.

        Retained for compatibility; not used for fields anymore.
        """
        try:
            if self.formatter is not None:
                message: str = self.formatter.format(record)
            else:
                message = record.getMessage()
        except Exception:
            message = record.getMessage()

        if record.stack_info:
            message = f"{message}\n\nStack:\n{record.stack_info}"
        return message

    @staticmethod
    def _format_exception(record: LogRecord) -> Optional[str]:
        """Return a formatted exception string if the record has exception info."""
        if record.exc_info:
            try:
                formatter = logging.Formatter()
                return formatter.formatException(record.exc_info)
            except Exception:
                return "Exception occurred, but could not format details."
        return None

    @staticmethod
    def _color_for_level(levelno: int) -> int:
        """Map logging levels to Discord embed colors.

        Colors are expressed as integer RGB values.
        """
        # Colors roughly matching Discord's branding and common severity tones
        if levelno >= logging.CRITICAL:
            return 0x992D22  # dark red
        if levelno >= logging.ERROR:
            return 0xE74C3C  # red
        if levelno >= logging.WARNING:
            return 0xF1C40F  # yellow
        if levelno >= logging.INFO:
            return 0x2ECC71  # green
        return 0x5865F2  # blurple for DEBUG/NOTSET

    @staticmethod
    def _truncate(text: str, limit: int) -> str:
        """Truncate text to Discord limits, appending ellipsis when necessary."""
        if len(text) <= limit:
            return text
        # Use textwrap to avoid breaking UTF-16 surrogate pairs
        clipped: str = textwrap.shorten(text, width=limit - 1, placeholder="…")
        if len(clipped) > limit:
            return clipped[: limit - 1] + "…"
        return clipped

    def _iter_extra_items(self, record: LogRecord) -> Iterable[tuple[str, Any]]:
        """Yield (key, value) pairs for extras attached to the record.

        Excludes standard LogRecord attributes and any private ("_") keys.
        """
        for key, value in record.__dict__.items():
            if key.startswith("_"):
                continue
            if key in self._STANDARD_ATTRS:
                continue
            # Skip None values
            if value is None:
                continue
            yield key, value

    def _format_extra_value(self, value: Any) -> str:
        """Format an extra value for inclusion in an embed field.

        - Strings: if JSON parseable, pretty-print as JSON in a ```js block; otherwise return as-is.
        - Bytes/bytearray: attempt UTF-8 decode; if JSON parseable, pretty-print; else wrap decoded text in a ```js block.
        - Mappings/Sequences: pretty-print as JSON in a ```js block.
        - Other types: attempt JSON with default=str; fallback to str(value).
        """
        # Strings: try to pretty JSON
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                pretty: str = json.dumps(parsed, indent=2, ensure_ascii=False)
                return f"```js\n{pretty}\n```"
            except Exception:
                return value

        # Bytes-like: decode and try JSON
        if isinstance(value, (bytes, bytearray)):
            try:
                text = value.decode("utf-8", errors="replace")
            except Exception:
                text = str(value)
            try:
                parsed = json.loads(text)
                pretty = json.dumps(parsed, indent=2, ensure_ascii=False)
                return f"```js\n{pretty}\n```"
            except Exception:
                return f"```js\n{text}\n```"

        # Mapping (e.g., dict, QueryDict-like after dict())
        if isinstance(value, Mapping):
            try:
                pretty = json.dumps(value, indent=2, ensure_ascii=False, default=str)
                return f"```js\n{pretty}\n```"
            except Exception:
                return str(value)

        # List/tuple-like sequences (avoid treating str/bytes again)
        if isinstance(value, (list, tuple)):
            try:
                pretty = json.dumps(value, indent=2, ensure_ascii=False, default=str)
                return f"```js\n{pretty}\n```"
            except Exception:
                return str(value)

        # Fallback generic JSON or str
        try:
            pretty = json.dumps(value, indent=2, ensure_ascii=False, default=str)
            return f"```js\n{pretty}\n```"
        except Exception:
            return str(value)


class DiscordAllowFilter(logging.Filter):
    """Filter that allows records for Discord based on logger name and level.

    A record passes if either:
    - Its logger name starts with one of the allowed prefixes, or
    - Its level is at least `min_level` (default: ERROR).

    This helps avoid noisy framework logs while still surfacing important
    errors like 500 responses from Django's request logger.
    """

    def __init__(
        self, allowed_prefixes: Sequence[str], min_level: int = logging.ERROR
    ) -> None:
        super().__init__()
        self._allowed_prefixes: tuple[str, ...] = tuple(allowed_prefixes)
        self._min_level: int = int(min_level)

    def filter(self, record: LogRecord) -> bool:  # type: ignore[override]
        name: str = record.name
        if any(name.startswith(p) for p in self._allowed_prefixes):
            return True
        return int(record.levelno) >= self._min_level


def get_discord_embed_handler() -> logging.Handler:
    """Factory for a configured DiscordEmbedHandler used by dictConfig.

    The factory reads configuration from Django settings to avoid circular
    imports at module load time. It returns a handler instance configured with
    the bot token, channel ID, and an environment-aware fallback log file.

    Returns
    -------
    logging.Handler
        A configured instance of DiscordEmbedHandler.
    """
    from pathlib import Path
    from django.conf import settings  # Imported here to avoid import-time side effects

    # In DEBUG, avoid writing any files; fall back to default error handling (stderr)
    fallback_path: Optional[str] = (
        None
        if settings.DEBUG
        else str(Path(settings.BASE_DIR) / "discord_fallback.log")
    )

    return DiscordEmbedHandler(
        bot_token=getattr(settings, "DISCORD_BOT_TOKEN", ""),
        channel_id=getattr(settings, "DISCORD_DEBUG_CHANNEL", ""),
        fallback_filename=fallback_path,
        timeout_seconds=5,
    )


def get_discord_allow_filter() -> logging.Filter:
    """Factory for the DiscordAllowFilter used by dictConfig.

    Allows our app loggers through and always allows ERROR+ from any logger
    (including Django's request logger) to surface real errors.
    """
    # Project app prefixes (adjustable later if needed)
    allowed_prefixes: list[str] = [
        "rod",
        "haven",
        "chronicle",
        "discordauth",
        "bot",
        "patreon",
        "gateway",
        "main",
    ]
    return DiscordAllowFilter(
        allowed_prefixes=allowed_prefixes, min_level=logging.ERROR
    )
