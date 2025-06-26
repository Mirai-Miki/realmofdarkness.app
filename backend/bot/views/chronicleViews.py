from django.http import JsonResponse, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from chronicle.models import Chronicle, Member, StorytellerRole
from chronicle.serializers import (
    ChronicleSerializer,
    ChronicleDeserializer,
    StorytellerRoleDeserializer,
)
from .get_post import get_post
from haven.models import Character
from haven.utility import get_serializer, get_derived_instance
from gateway.constants import Group

channel_layer = get_channel_layer()


@method_decorator(csrf_exempt, name="dispatch")
class MemberDeleteView(View):
    """
    View to handle member deletion and update related characters.
    """

    def post(self, request):
        data = get_post(request)
        guild_id = data["guild_id"]
        user_id = data["member_id"]

        try:
            member = Member.objects.get(chronicle=guild_id, user=user_id)
        except Member.DoesNotExist:
            return HttpResponse(status=204)

        for character in member.character_set.all():
            character = get_derived_instance(character)
            character.chronicle = None
            if character.st_lock:
                character.st_lock = False

            character.save()
            async_to_sync(channel_layer.group_send)(
                Group.character_update(character.id),
                {
                    "type": "character.update",
                    "id": character.id,
                    "tracker": get_serializer(character.splat).data,
                },
            )

        member.delete()
        return HttpResponse()


@method_decorator(csrf_exempt, name="dispatch")
class SetTrackerChannelView(View):
    """
    View to set or unset the tracker channel for a guild.
    """

    def post(self, request):
        data = get_post(request)
        guild_id = data["guild_id"]
        channel_id = data["channel_id"]

        try:
            guild = Chronicle.objects.get(pk=guild_id)
        except Chronicle.DoesNotExist:
            return HttpResponse(status=418)

        if guild.tracker_channel == channel_id:
            guild.tracker_channel = ""
            response = {"channel_id": None}
        else:
            guild.tracker_channel = channel_id
            response = {"channel_id": channel_id}

        guild.save()
        return JsonResponse(response)


@method_decorator(csrf_exempt, name="dispatch")
class GetTrackerChannelView(View):
    """
    View to get the tracker channel for a guild.
    """

    def post(self, request):
        data = get_post(request)

        try:
            guild = Chronicle.objects.get(pk=data["guild_id"])
        except Chronicle.DoesNotExist:
            return HttpResponse(status=418)

        if not guild.tracker_channel:
            return HttpResponse(status=204)
        else:
            return JsonResponse({"channel_id": guild.tracker_channel})


@method_decorator(csrf_exempt, name="dispatch")
class SetStorytellerRoleView(View):
    """
    View to set or unset a storyteller role for a guild.
    """

    def post(self, request):
        data = get_post(request)
        guild_id = data["guild_id"]
        role_data = {"id": data["role_id"], "guild": guild_id}

        try:
            guild = Chronicle.objects.get(pk=guild_id)
        except Chronicle.DoesNotExist:
            return HttpResponse(status=418)

        try:
            role = StorytellerRole.objects.get(pk=role_data["id"])
            role_serializer = StorytellerRoleDeserializer(
                role, data=role_data, partial=True
            )
        except StorytellerRole.DoesNotExist:
            role_serializer = StorytellerRoleDeserializer(data=role_data)

        if role_serializer.is_valid():
            role = role_serializer.save()

            st_roles = StorytellerRole.objects.filter(guild=guild)
            role_ids = [str(role.id) for role in st_roles]

            return JsonResponse({"roleIds": role_ids})
        else:
            return JsonResponse(role_serializer.errors, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class GetStorytellerRolesView(View):
    """
    View to get all storyteller roles for a guild.
    """

    def post(self, request):
        data = get_post(request)

        st_roles = StorytellerRole.objects.filter(guild=int(data["guild_id"]))
        role_ids = [str(role.id) for role in st_roles]

        return JsonResponse({"roles": role_ids})


@method_decorator(csrf_exempt, name="dispatch")
class DeleteStorytellerRoleView(View):
    """
    View to delete a storyteller role.
    """

    def post(self, request):
        data = get_post(request)
        role_id = data["role_id"]

        try:
            StorytellerRole.objects.get(pk=role_id).delete()
        except StorytellerRole.DoesNotExist:
            return HttpResponse(status=204)

        return HttpResponse(status=200)


@method_decorator(csrf_exempt, name="dispatch")
class SetGuildView(View):
    """
    View to set or update a guild.
    """

    def post(self, request):
        data = get_post(request)
        guild_data = data["guild"]

        # Ensure bot is a list
        if isinstance(guild_data["bot"], str):
            guild_data["bot"] = [guild_data["bot"]]

        try:
            chronicle = Chronicle.objects.get(pk=guild_data["id"])
            chronicle_serializer = ChronicleDeserializer(
                chronicle, data=guild_data, partial=True
            )
        except Chronicle.DoesNotExist:
            chronicle_serializer = ChronicleDeserializer(data=guild_data)

        if chronicle_serializer.is_valid():
            chronicle = chronicle_serializer.save()

            async_to_sync(channel_layer.group_send)(
                Group.chronicle_update(chronicle.id),
                {
                    "type": "chronicle.update",
                    "chronicle": ChronicleSerializer(chronicle).data,
                },
            )
            return HttpResponse(status=200)
        else:
            return JsonResponse(chronicle_serializer.errors, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class DeleteGuildView(View):
    """
    View to delete a guild.
    """

    def post(self, request):
        data = get_post(request)
        guild_id = data["guild_id"]

        try:
            Chronicle.objects.get(pk=guild_id).delete()
        except Chronicle.DoesNotExist:
            pass  # No need to do anything

        return HttpResponse(status=200)


@method_decorator(csrf_exempt, name="dispatch")
class SetDefaultsView(View):
    """
    View to set default character and auto hunger for a member.
    """

    def post(self, request):
        data = get_post(request)
        try:
            member = Member.objects.get(
                user_id=data["user_id"], chronicle_id=data["guild_id"]
            )
        except Member.DoesNotExist:
            return HttpResponse(status=404)

        if data["disable"]:
            member.default_character = None
            member.default_auto_hunger = False
            member.save()
            return HttpResponse(status=200)

        try:
            character = Character.objects.get(
                user_id=data["user_id"], name__iexact=data["name"]
            )
        except Character.DoesNotExist:
            return HttpResponse(status=204)

        member.default_character = character
        member.default_auto_hunger = data["auto_hunger"]
        member.save()
        return HttpResponse(status=200)


@method_decorator(csrf_exempt, name="dispatch")
class GetDefaultsView(View):
    """
    View to get default character and auto hunger for a member.
    First checks for default character, then falls back to single character matching criteria.
    """

    def post(self, request):
        data = get_post(request)
        splat_filter = data.get("splats", None)

        # Normalize splat_filter to list if it's a string
        if splat_filter and isinstance(splat_filter, str):
            splat_filter = [splat_filter]

        try:
            member = Member.objects.get(
                user_id=data["user_id"], chronicle_id=data["guild_id"]
            )
        except Member.DoesNotExist:
            return HttpResponse(status=404)

        # Case 1: Check if default character exists and matches filters
        if member.default_character:
            character = member.default_character
            if character._meta.model == Character:
                character = get_derived_instance(character)

            # If splat filter is provided, check if default character's splat matches
            if not splat_filter or character.splat in splat_filter:
                character_serializer = get_serializer(character.splat)
                defaults = {
                    "character": character_serializer(character).data,
                    "auto_hunger": member.default_auto_hunger,
                }
                return JsonResponse(defaults)

        # Case 2: No default character or default doesn't match splat filter
        # Query directly with splat filter if provided
        chronicle_characters = Character.objects.filter(
            user_id=data["user_id"], chronicle_id=data["guild_id"]
        )

        if splat_filter:
            chronicle_characters = chronicle_characters.filter(splat__in=splat_filter)

        if not chronicle_characters.exists():
            return HttpResponse(status=204)  # No characters found

        # If exactly one character matches our criteria, return it
        if chronicle_characters.count() == 1:
            base_character = chronicle_characters.first()
            selected_character = get_derived_instance(base_character)
            character_serializer = get_serializer(selected_character.splat)
            defaults = {
                "character": character_serializer(selected_character).data,
                # Use default auto hunger if set, otherwise default to False
                "auto_hunger": (
                    member.default_auto_hunger if member.default_character else False
                ),
            }
            return JsonResponse(defaults)

        # Multiple characters match criteria
        return HttpResponse(status=204)
