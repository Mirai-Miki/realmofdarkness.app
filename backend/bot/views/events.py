"""
Events publisher placeholder for gateway/Channels notifications.

This module abstracts sending real-time events to Channels. It is a
lightweight placeholder to enable refactoring of views to a modular,
type-safe interface. A full implementation will be provided later.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class EventsPublisher:
    """Placeholder events publisher.

    Methods log what would be sent to the gateway. Replace with a proper
    ChannelsEventsManager later and keep the same interface.
    """

    def character_updated(
        self, character_id: int, splat: str, payload: Dict[str, Any]
    ) -> None:
        """Notify that a character has been updated.

        Args:
            character_id: The database ID of the character.
            splat: The game system/splat identifier.
            payload: Serialized character payload for the tracker/sheet.
        """
        logger.info("[Events] character.update id=%s splat=%s", character_id, splat)

    def member_deleted(self, user_id: int, chronicle_id: int) -> None:
        """Notify that a member has been removed from a chronicle.

        Args:
            user_id: The user's ID.
            chronicle_id: The chronicle ID.
        """
        logger.info(
            "[Events] member.delete user=%s chronicle=%s", user_id, chronicle_id
        )

    def chronicle_updated(
        self, chronicle_id: int, payload: Optional[Dict[str, Any]] = None
    ) -> None:
        """Notify that a chronicle has been updated.

        Args:
            chronicle_id: Chronicle ID.
            payload: Optional serialized chronicle payload.
        """
        logger.info("[Events] chronicle.update id=%s", chronicle_id)

    def user_updated(self, user_id: int, is_new_user: bool = False) -> None:
        """Notify that a user has been updated or created.

        Args:
            user_id: The user's Discord ID.
            is_new_user: Whether this is a new user creation.
        """
        event_type = "user.create" if is_new_user else "user.update"
        logger.info(f"[Events] {event_type} id=%s", user_id)

    def member_created(self, member_id: int, user_id: int, chronicle_id: int) -> None:
        """Notify that a new member has been created.

        Args:
            member_id: The member's database ID.
            user_id: The user's ID.
            chronicle_id: The chronicle ID.
        """
        logger.info(
            "[Events] member.create id=%s user=%s chronicle=%s",
            member_id,
            user_id,
            chronicle_id,
        )

    def member_updated(
        self, member_id: int, staff_status_changed: bool = False
    ) -> None:
        """Notify that a member has been updated.

        Args:
            member_id: The member's database ID.
            staff_status_changed: Whether the member's staff status changed.
        """
        logger.info(
            "[Events] member.update id=%s staff_changed=%s",
            member_id,
            staff_status_changed,
        )
