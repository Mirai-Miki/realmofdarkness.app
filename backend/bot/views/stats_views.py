from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, Mapping, cast, TYPE_CHECKING

import logging
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .bot_base_api_view import BotBaseAPIView
from bot.models import Bot, CommandStat
from bot.serializers import CommandStatSerializer
from haven.models import Character


if TYPE_CHECKING:
    from discordauth.models import User as UserModel

logger = logging.getLogger(__name__)
User = cast("UserModel", get_user_model())


class StatsAPIView(BotBaseAPIView):
    """Return aggregate usage statistics."""

    def get(self, request: Request) -> Response:
        """Get usage statistics for the last N days.

        Query params:
        - days: Number of days to include (optional, default=30)

        Returns:
        - 200: {
            "users": {"total": "...", "30days": "...", "14days": "..."},
            "characters": [{"count": n, "splat": "..."}, ...],
            "sheets": [{"count": n, "splat": "..."}, ...],
            "all_time_characters": [{"count": n, "splat": "..."}, ...],
            "command_stats": [{"command": "...", "bot__username": "...", "count": n}, ...]
          }
        """
        try:
            days_param = int(request.query_params.get("days", 30))
            if days_param <= 0:
                days_param = 30
        except (TypeError, ValueError):
            days_param = 30

        users_qs = User.objects.all()
        timestamp_30days = date.today() - timedelta(days=30)
        timestamp_14days = date.today() - timedelta(days=14)
        users_30days = users_qs.filter(last_active__gt=timestamp_30days)
        users_14days = users_30days.filter(last_active__gt=timestamp_14days)

        user_stats = {
            "total": str(users_qs.count()),
            "30days": str(users_30days.count()),
            "14days": str(users_14days.count()),
        }

        timestamp_days = date.today() - timedelta(days=days_param)

        # Command Stats
        command_stats = (
            CommandStat.objects.filter(last_used__gt=timestamp_days)
            .values("command", "bot__username")
            .order_by()
            .annotate(count=Count("command"))
            .order_by("-count")
        )

        # Total unique users per bot
        total_users_per_bot = (
            CommandStat.objects.filter(last_used__gt=timestamp_days)
            .values("bot__username", "user")
            .distinct()
        )

        totals: Dict[str, Dict[str, Any]] = {}
        for stat in total_users_per_bot:
            bot_name = cast(str, stat["bot__username"])  # values() returns dicts
            if bot_name in totals:
                totals[bot_name]["count"] = int(totals[bot_name]["count"]) + 1
            else:
                totals[bot_name] = {
                    "bot__username": bot_name,
                    "command": "Total Users",
                    "count": 1,
                }

        stats = list(totals.values()) + list(command_stats)

        # Character Stats - Updated for new inheritance model
        all_characters = (
            Character.objects.filter(
                last_updated__gt=timestamp_days, splat__isnull=False, is_sheet=False
            )
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )

        char_stats = [
            {"count": c["count"], "splat": c["splat"]} for c in all_characters
        ]

        sheets = (
            Character.objects.filter(
                last_updated__gt=timestamp_days, is_sheet=True, splat__isnull=False
            )
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )
        sheet_stats = [{"count": s["count"], "splat": s["splat"]} for s in sheets]

        all_time_characters = (
            Character.objects.filter(splat__isnull=False)
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )
        all_time_chars = [
            {"count": c["count"], "splat": c["splat"]} for c in all_time_characters
        ]

        return Response(
            {
                "users": user_stats,
                "characters": char_stats,
                "sheets": sheet_stats,
                "all_time_characters": all_time_chars,
                "command_stats": stats,
            }
        )


class CommandUsedAPIView(BotBaseAPIView):
    """Record command usage events from bots."""

    def post(self, request: Request) -> Response:
        """Record a command usage event.

        Body format:
        {
            "user_id": "<discord_user_id>",
            "bot_id": "<discord_bot_id>",
            "command": "<command_name>"
        }

        Returns:
        - 200: Command usage recorded successfully
        - 400: Invalid data
        - 404: User or bot not found
        """
        data_obj: Any = request.data
        if isinstance(data_obj, Mapping):
            payload: Dict[str, Any] = dict(data_obj)
        else:
            payload = cast(Dict[str, Any], data_obj)

        user_id = payload.get("user_id")
        command = payload.get("command")
        bot_id = payload.get("bot_id")

        if not all([user_id, command, bot_id]):
            logger.warning(
                "[CommandUsedAPIView] received incomplete data",
                extra={"body": getattr(request, "body", "No body available")},
            )
            return Response(
                {"message": "user_id, command, and bot_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=user_id)
            bot = Bot.objects.get(pk=bot_id)
            discord_user = cast("UserModel", user)
        except (User.DoesNotExist, Bot.DoesNotExist) as e:
            logger.exception(
                "[CommandUsedAPIView] User or Bot not found",
                exc_info=e,
                extra={"body": getattr(request, "body", "No body available")},
            )
            return Response(
                {"message": f"User or Bot not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            stat = CommandStat.objects.get(user=discord_user, command=command, bot=bot)
            serializer = CommandStatSerializer(
                stat, data={"used": stat.used + 1}, partial=True
            )
        except CommandStat.DoesNotExist:
            serializer = CommandStatSerializer(
                data={"user_id": discord_user.pk, "command": command, "bot_id": bot.pk}
            )

        if not serializer.is_valid():
            logger.error(
                f"[CommandUsedAPIView] CommandStat serializer validation failed: {serializer.error_messages}",
                extra={"body": getattr(request, "body", "No body available")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        stat = serializer.save()
        discord_user.last_active = timezone.now()
        discord_user.save(update_fields=["last_active"])
        return Response(CommandStatSerializer(stat).data, status=status.HTTP_200_OK)
