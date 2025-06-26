from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response

from ..Authenticate import authenticate
from haven.models import Character
from gateway.constants import Group
from gateway.serializers import serialize_character

channel_layer = get_channel_layer()


class DeleteCharacters(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        id_list = request.data["ids"]
        disconnect = request.data["disconnect"]
        names = []

        for id in id_list:
            char = Character.objects.get(pk=int(id))
            names.append(char.name)

            if disconnect:
                char.chronicle = None
                if char.st_lock:
                    char.st_lock = False
                char.save()
                async_to_sync(channel_layer.group_send)(
                    Group.character_update(char.id),
                    {
                        "type": "character.update",
                        "id": char.id,
                        "tracker": serialize_character(char),
                    },
                )

            else:
                if char.avatar:
                    char.avatar.delete()
                char.delete()
                async_to_sync(channel_layer.group_send)(
                    Group.character_update(id), {"type": "character.delete", "id": id}
                )

        return Response(data={"names": names})
