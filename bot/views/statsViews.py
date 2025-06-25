from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.db.models import Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from typing import cast

from haven.models import Character
from bot.models import CommandStat, Bot
from bot.serializers import CommandStatSerializer, CommandStatDeserializer
from discordauth.models import User as DiscordUser

User = get_user_model()


class StatsAPIView(APIView):
    """
    API view to get statistics for users, characters, and commands.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Get comprehensive statistics for the past 30 days.
        """
        users = User.objects.all()

        # User Stats
        timestamp_30days = date.today() - timedelta(days=30)
        timestamp_14days = date.today() - timedelta(days=14)
        users_30days = users.filter(last_active__gt=timestamp_30days)
        users_14days = users_30days.filter(last_active__gt=timestamp_14days)

        user_stats = {
            "total": str(users.count()),
            "30days": str(users_30days.count()),
            "14days": str(users_14days.count()),
        }

        # Command Stats
        command_stats = (
            CommandStat.objects.filter(last_used__gt=timestamp_30days)
            .values("command", "bot__username")
            .order_by()
            .annotate(count=Count("command"))
            .order_by("-count")
        )

        # Total unique users per bot
        total_users_per_bot = (
            CommandStat.objects.filter(last_used__gt=timestamp_30days)
            .values("bot__username", "user")
            .distinct()
        )

        totals = {}
        for stat in total_users_per_bot:
            bot_name = stat["bot__username"]
            if bot_name in totals:
                totals[bot_name]["count"] += 1
            else:
                totals[bot_name] = {
                    "bot__username": bot_name,
                    "command": "Total Users",
                    "count": 1,
                }

        stats = list(totals.values()) + list(command_stats)

        # Character Stats - Updated for new inheritance model
        # Get all characters with splat field populated (excludes sheets - trackers only)
        all_characters = (
            Character.objects.filter(
                last_updated__gt=timestamp_30days, splat__isnull=False, is_sheet=False
            )
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )

        char_stats = []
        for char in all_characters:
            char_stats.append({"count": char["count"], "splat": char["splat"]})

        # Get sheet-only statistics
        sheet_stats = []
        sheets = (
            Character.objects.filter(
                last_updated__gt=timestamp_30days, is_sheet=True, splat__isnull=False
            )
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )

        for sheet in sheets:
            sheet_stats.append({"count": sheet["count"], "splat": sheet["splat"]})

        # Get all characters in database (regardless of last_updated)
        all_time_chars = []
        all_time_characters = (
            Character.objects.filter(splat__isnull=False)
            .values("splat")
            .annotate(count=Count("splat"))
            .order_by("-count")
        )

        for char in all_time_characters:
            all_time_chars.append({"count": char["count"], "splat": char["splat"]})

        return Response(
            {
                "users": user_stats,
                "characters": char_stats,
                "sheets": sheet_stats,
                "all_time_characters": all_time_chars,
                "command_stats": stats,
            }
        )


class CommandUsedAPIView(APIView):
    """
    API view to record command usage statistics.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Record a command usage event.
        """
        user_id = request.data.get("user_id")
        command = request.data.get("command")
        bot_id = request.data.get("bot_id")

        if not all([user_id, command, bot_id]):
            return Response(
                {"error": "user_id, command, and bot_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=user_id)
            bot = Bot.objects.get(pk=bot_id)
            # Cast to the actual User type to access custom fields
            discord_user = cast(DiscordUser, user)
        except (User.DoesNotExist, Bot.DoesNotExist) as e:
            return Response(
                {"error": f"User or Bot not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Try to get existing stat and increment
            stat = CommandStat.objects.get(user=discord_user, command=command, bot=bot)
            stat_serializer = CommandStatDeserializer(
                stat, data={"used": stat.used + 1}, partial=True
            )
        except CommandStat.DoesNotExist:
            # Create new stat
            stat_serializer = CommandStatDeserializer(
                data={"user": discord_user.pk, "command": command, "bot": bot.pk}
            )

        if stat_serializer.is_valid():
            stat = stat_serializer.save()
            discord_user.last_active = timezone.now()
            discord_user.save()
            return Response(CommandStatSerializer(stat).data, status=status.HTTP_200_OK)
        else:
            return Response(stat_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
