import hashlib
import hmac
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import PatreonWebhookSerializer
from constants import Supporter
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class PatreonWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Verify the HMAC signature
        signature = request.headers.get("X-Patreon-Signature")
        event = request.headers.get("X-Patreon-Event")
        if not signature:
            return Response(
                {"error": "Signature missing"}, status=status.HTTP_400_BAD_REQUEST
            )

        secret = settings.PATREON_WEBHOOK_SECRET
        body = json.dumps(
            json.loads(request.body.decode("utf-8")), separators=(",", ":")
        )
        expected_signature = hmac.new(
            secret.encode(), body.encode(), hashlib.md5
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            return Response(
                {"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Process the webhook payload
        serializer = PatreonWebhookSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data["data"]
            included = serializer.validated_data["included"]
            attributes = data.get("attributes", {})
            email = attributes.get("email", None)

            discord_id = None
            for item in included:
                if item["type"] == "user":
                    social_connections = item["attributes"].get(
                        "social_connections", {}
                    )
                    discord = social_connections.get("discord", {})
                    if discord:
                        discord_id = discord.get("user_id", None)
                    if item["attributes"].get("vanity"):
                        name = item["attributes"]["vanity"]
                    else:
                        name = item["attributes"].get("full_name", "")
                    break

            # if not discord_id:
            #  return Response(status=204)

            relationships = data.get("relationships")
            if not relationships:
                return Response(status=204)

            currently_entitled_tiers = relationships.get("currently_entitled_tiers")
            if not currently_entitled_tiers:
                return Response(status=204)

            tier_ids = currently_entitled_tiers["data"]
            tier_id = (
                currently_entitled_tiers["data"][0].get("id")
                if len(currently_entitled_tiers["data"])
                else None
            )

            tier = Supporter.convert_patreon_id(tier_id)

            """
            try:
              user = User.objects.get(id=discord_id)
            except User.DoesNotExist:
              user = User.objects.create_user({
                'id': discord_id,
                'username': name,
                'discriminator': '0',
              })
            user.supporter = tier
            user.save()
            """

            with open("patreon_test.txt", "a") as f:
                f.write(f"Header x-patreon-event: {event}\n")
                f.write(json.dumps(json.loads(request.body.decode("utf-8")), indent=4))
                f.write(f"\n\n")

            # Send a message to Discord
            discord_token = settings.DISCORD_BOT_TOKEN
            channel_id = settings.DISCORD_DEBUG_CHANNEL
            url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
            headers = {
                "Authorization": f"Bot {discord_token}",
                "Content-Type": "application/json",
            }
            message = {
                "content": f"Patreon Webhook POST - {event}\n<@{discord_id}>\nName: {name}\nEmail: {email}\nTier Ids: {tier_ids} || Tier: {tier}"
            }
            requests.post(url, headers=headers, json=message)

            return Response(status=200)
        return Response(serializer.errors, status=400)
