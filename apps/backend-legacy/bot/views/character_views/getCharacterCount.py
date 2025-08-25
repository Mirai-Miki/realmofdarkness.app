from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from haven.models import Character
from django.db import models
from rest_framework.views import APIView
from ..Authenticate import authenticate


class GetCharacterCountView(APIView):
    """
    API view for retrieving character counts for a user.

    Returns global counts (all characters for the user) and optionally
    guild-specific counts if guild_id is provided.

    Expected POST data:
    - user_id: The ID of the user (required)
    - guild_id: The ID of the guild/chronicle (optional)

    Returns:
    {
        "global": {
            "sheets": int,      // Total character sheets
            "trackers": int,    // Total character trackers
            "total": int        // Total characters (sheets + trackers)
        },
        "guild": {             // Only if guild_id provided
            "sheets": int,      // Guild character sheets
            "trackers": int,    // Guild character trackers
            "total": int        // Guild total characters
        }
    }
    """

    def post(self, request):
        authenticate(request)

        user_id = request.data.get("user_id")
        guild_id = request.data.get("guild_id")

        if not user_id:
            return Response(
                {"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get global character counts for the user in one query
        global_counts = Character.objects.filter(user_id=user_id)
        global_grouped = global_counts.values("is_sheet").annotate(
            count=models.Count("id")
        )

        global_map = {g["is_sheet"]: g["count"] for g in global_grouped}
        global_sheets = global_map.get(True, 0)
        global_trackers = global_map.get(False, 0)
        global_total = global_sheets + global_trackers
        result = {
            "global": {
                "sheets": global_map.get(True, 0),
                "trackers": global_map.get(False, 0),
                "total": global_total,
            }
        }

        # If guild_id provided, also get guild-specific counts
        if guild_id:
            guild_counts = Character.objects.filter(
                user_id=user_id, chronicle_id=guild_id
            )
            guild_grouped = guild_counts.values("is_sheet").annotate(
                count=models.Count("id")
            )
            guild_map = {g["is_sheet"]: g["count"] for g in guild_grouped}
            guild_sheets = guild_map.get(True, 0)
            guild_trackers = guild_map.get(False, 0)
            guild_total = guild_sheets + guild_trackers
            result["chronicle"] = {
                "sheets": guild_sheets,
                "trackers": guild_trackers,
                "total": guild_total,
            }

        return Response(result, status=status.HTTP_200_OK)
