from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from time import time
from rest_framework import status

from ..Authenticate import authenticate
from haven.models import Character
from haven.serializers import validation_error_handler
from gateway.constants import Group
from bot.downloadAndVerifyImage import download_and_verify_image
from constants import ImageError, TrackerLimit, Supporter
from haven.utility import get_deserializer, get_tracker_serializer


channel_layer = get_channel_layer()
User = get_user_model()


class NewCharacter(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        character = request.data["character"]
        image_url = character.get("avatar", None)
        image_file = None

        if image_url:
            image_file, failure_reason = download_and_verify_image(image_url)

        if image_url and not image_file:
            if failure_reason == ImageError.TOO_LARGE:
                return HttpResponse(
                    "Image too large (max 5MB)",
                    status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                )
            elif failure_reason == ImageError.INVALID_IMAGE:
                return HttpResponse(
                    "Invalid image format",
                    status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                )
            else:
                return HttpResponse(
                    "Failed to download image",
                    status=status.HTTP_406_NOT_ACCEPTABLE,
                )

        user = User.objects.get(pk=character["user"])
        supporter_level = getattr(user, "supporter", Supporter.NONE)
        max_trackers = TrackerLimit.get_amount(supporter_level)
        count = Character.objects.filter(user=character["user"]).count()
        if count > max_trackers:  # 409 Conflict - Too many Characters
            return HttpResponse(status=409)
        char = Character.objects.filter(
            name__iexact=character["name"], user=character["user"]
        )
        if char:
            # 304 Not Modified - Character exists
            return HttpResponse(status=304)

        splat = character["splat"]
        Deserializer = get_deserializer(splat)
        TrackerSerializer = get_tracker_serializer(splat)

        deserializer = Deserializer(
            data=character,
            context={
                "user_id": user,
                "is_owner": True,
                "from_bot": True,
            },
        )

        if deserializer.is_valid():

            instance = deserializer.save()
            if image_file:
                instance.avatar.save(
                    image_file.name.replace(
                        "downloaded_image", f"{instance.id}_{int(time())}"
                    ),
                    image_file,
                )
        else:
            return validation_error_handler(deserializer.errors)

        tracker = TrackerSerializer(instance).data
        async_to_sync(channel_layer.group_send)(
            Group.character_new(),
            {
                "type": "character.new",
                "id": instance.id,
                "tracker": tracker,
                "class": splat,
            },
        )

        return Response(status=201)
