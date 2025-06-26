from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.utils import IntegrityError
from django.db.models import Q

from api.throttling import get_throttles
from gateway.constants import Group
from gateway.serializers import serialize_character
from constants import CharacterSheetLimit
from chronicle.models import Member
from haven.models import Vampire5th, Character, SheetStatus
from haven.utility import get_derived_instance
from haven.serializers import (
    Vampire5thSerializer,
    Vampire5thDeserializer,
    V5TrackerSerializer,
)

channel_layer = get_channel_layer()


class CharacterSheetCreateV5(APIView):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        return get_throttles(self.request.user)

    def get(self, request):
        # Get the current user
        user = request.user
        # Get the 'name' parameter from the query parameters
        name = request.GET.get("name")
        if not name:
            return Response(status=403)

        # Check Sheet Limits
        count = Character.objects.filter(
            user=user, is_sheet=True, status__lt=SheetStatus.DEAD
        ).count()
        max_active_sheets = CharacterSheetLimit.get_amount(user.supporter)

        if count >= max_active_sheets:
            m = {
                "error": [
                    "You are at your character limit. You must delete or archive some characters before you can make a new one.",
                    "Please look at our supporter tiers to access a higher limit.",
                ]
            }
            return Response(m, status=status.HTTP_403_FORBIDDEN)

        # Create a new character instance with the given name
        try:
            character = Vampire5th.objects.create(
                user=user,
                name=name,
                is_sheet=True,
                splat="vampire5th",
            )
        except IntegrityError:
            return Response(
                "You already have a character with this name",
                status=status.HTTP_409_CONFLICT,
            )

        async_to_sync(channel_layer.group_send)(
            Group.character_new(),
            {
                "type": "character.new",
                "id": character.id,
                "tracker": V5TrackerSerializer(character).data,
                "class": "vampire5th",
            },
        )

        # Return the PK of the newly created instance
        data = {"id": character.id}
        return Response(data)


class GetV5Character(APIView):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        return get_throttles(self.request.user)

    def get(self, request):
        user = request.user
        id = request.GET.get("id")
        must_be_sheet = request.GET.get("sheet")

        try:
            character = Vampire5th.objects.get(pk=id)
        except Vampire5th.DoesNotExist:
            return Response("Character does not exist!", status=404)

        is_owner = character.user == user
        is_admin_or_storyteller = is_admin_or_st(character, user)

        if not character.is_sheet and must_be_sheet:
            return Response(
                "This is not a Sheet", status=status.HTTP_406_NOT_ACCEPTABLE
            )

        if not (is_owner or is_admin_or_storyteller):
            return Response(
                "You do not have permission to view this character", status=403
            )

        serializer = Vampire5thSerializer(character)
        return Response(serializer.data)


class CharacterUpdateV5(APIView):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        return get_throttles(self.request.user)

    def put(self, request, id):
        user = request.user

        try:
            character = Vampire5th.objects.get(pk=id)
        except Vampire5th.DoesNotExist:
            return Response({"message": ["Character not found"]}, status=404)

        if not character.is_sheet:
            return Response(
                "This is not a Sheet", status=status.HTTP_406_NOT_ACCEPTABLE
            )

        is_owner = character.user == user
        is_admin_or_storyteller = is_admin_or_st(character, user)
        if not (is_owner or is_admin_or_storyteller):
            return Response(
                "You do not have permission to edit this character", status=403
            )

        serializer = Vampire5thDeserializer(
            character,
            data=request.data,
            partial=True,
            context={
                "user_id": str(user.id),
                "is_owner": is_owner,
                "is_admin_or_storyteller": is_admin_or_storyteller,
                "chronicles": Member.objects.filter(user=user).values_list(
                    "chronicle", flat=True
                ),
            },
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        instance = serializer.save()
        async_to_sync(channel_layer.group_send)(
            Group.character_update(instance.id),
            {
                "type": "character.update",
                "id": instance.id,
                "tracker": V5TrackerSerializer(instance).data,
                "sheet": Vampire5thSerializer(instance).data,
                "class": "vampire5th",
            },
        )

        return Response()


class DeleteCharacter(APIView):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        return get_throttles(self.request.user)

    def delete(self, request):
        user = request.user
        pk = request.GET.get("id")

        if not pk or not pk.isdigit():
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            character = Character.objects.get(pk=pk)
        except Character.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        if character.user == user:
            if character.avatar:
                character.avatar.delete()
            character.delete()
            async_to_sync(channel_layer.group_send)(
                Group.character_update(pk), {"type": "character.delete", "id": pk}
            )
            return Response(status=status.HTTP_200_OK)
        elif is_admin_or_st(character, user):
            character.member = None
            character.chronicle = None
            character.st_lock = False
            character.save()
            sheet = None
            if character.is_sheet:
                sheet = Vampire5thSerializer(get_derived_instance(character)).data
            async_to_sync(channel_layer.group_send)(
                Group.character_update(character.id),
                {
                    "type": "character.update",
                    "id": character.id,
                    "tracker": serialize_character(character),
                    "sheet": sheet,
                    "class": "vampire5th",
                },
            )
            return Response(status=status.HTTP_200_OK)
        else:
            return Response("Invalid Permission", status=status.HTTP_403_FORBIDDEN)


def is_admin_or_st(character, user):
    if (
        character.chronicle
        and Member.objects.filter(
            Q(user=user)
            & Q(chronicle=character.chronicle)
            & (Q(admin=True) | Q(storyteller=True))
        ).exists()
    ):
        return True
    else:
        return False
