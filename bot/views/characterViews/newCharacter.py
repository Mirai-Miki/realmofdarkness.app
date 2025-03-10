from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from time import time

from ..Authenticate import authenticate
from haven.models import Character
from haven.serializers import validation_error_handler
from gateway.constants import Group
from bot.downloadAndVerifyImage import download_and_verify_image
from haven.utility import get_deserializer, get_tracker_serializer


channel_layer = get_channel_layer()
User = get_user_model()

MAX_TRACKERS = 50


class NewCharacter(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        character = request.data["character"]
        image_url = character.get("avatar", None)
        image_file = None
        if image_url:
            image_file = download_and_verify_image(image_url)
        if image_url and not image_file:
            return HttpResponse(status=406)

        count = Character.objects.filter(user=character["user"]).count()
        if count > MAX_TRACKERS:  # 409 Conflict - Too many Characters
            return HttpResponse(status=409)
        user = User.objects.get(pk=character["user"])

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
