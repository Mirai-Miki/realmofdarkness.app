from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from time import time
from rest_framework import status

from rest_framework.views import APIView
from rest_framework.response import Response

from re import match
from ..Authenticate import authenticate
from haven.serializers import validation_error_handler
from gateway.constants import Group
from bot.downloadAndVerifyImage import download_and_verify_image
from constants import ImageError
from haven.utility import (
    get_character_model,
    get_deserializer,
    get_serializer,
    get_tracker_serializer,
)

channel_layer = get_channel_layer()
User = get_user_model()


class SaveCharacter(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        user_id = request.data["character"]["user"]
        id = request.data["character"]["id"]
        image_url = request.data["character"].get("avatar", None)
        image_file = None

        if image_url and match(r"^https:\/\/realmofdarkness\.app", image_url):
            image_url = None
        elif image_url:
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

        splat = request.data["character"]["splat"]
        Character = get_character_model(splat)
        Serializer = get_serializer(splat)
        Deserializer = get_deserializer(splat)
        TrackerSerializer = get_tracker_serializer(splat)
        try:
            character = Character.objects.get(pk=id, user__id=user_id)
        except Character.DoesNotExist:
            return Response({"message": "Character not found"}, status=404)

        deserializer = Deserializer(
            character,
            data=request.data["character"],
            context={
                "user_id": user_id,
                "is_owner": True,
                "from_bot": True,
            },
        )

        if deserializer.is_valid():
            instance = deserializer.save()
        else:
            # 304 Not Modified for Character with the same name on name change
            return validation_error_handler(deserializer.errors)
        if image_file:
            if instance.avatar:
                instance.avatar.delete()
            instance.avatar.save(
                image_file.name.replace(
                    "downloaded_image", f"{instance.id}_{int(time())}"
                ),
                image_file,
            )

        async_to_sync(channel_layer.group_send)(
            Group.character_update(instance.id),
            {
                "type": "character.update",
                "id": instance.id,
                "tracker": TrackerSerializer(instance).data,
                "sheet": Serializer(instance).data,
                "class": splat,
            },
        )

        return Response(status=200)
