from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

from haven.models import Character
from haven.utility import get_serializer, get_character_model, get_derived_instance
from ..Authenticate import authenticate


class GetCharacter(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        name = request.data.get("name", None)
        user_id = request.data.get("user_id", None)
        pk = request.data.get("pk", None)
        splat = request.data.get("splat", None)

        if splat:
            model = get_character_model(splat)
            if pk:
                character = model.objects.filter(pk=pk)
            elif not user_id:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                character = model.objects.filter(user=user_id, name=name)
        else:
            if pk:
                character = Character.objects.filter(pk=pk)
            elif not user_id:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                character = Character.objects.filter(user=user_id, name=name)

        if not character.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        elif character.count() > 1:
            return Response(status=status.HTTP_300_MULTIPLE_CHOICES)

        if not splat:
            splat = character[0].splat
            model = get_character_model(splat)
            character = model.objects.filter(pk=character[0].pk)

        Serializer = get_serializer(splat)
        return Response(data=Serializer(character[0]).data)


class GetCharacterDefault(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)

        name = request.data.get("name", None)
        user = request.data.get("user", None)
        chronicle = request.data.get("chronicle", None)
        characters = None
        select = ["character5th__vampire5th"]

        if not user:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if name:
            characters = Character.objects.select_related(*select).filter(
                user=user, name=name
            )
        else:
            characters = Character.objects.select_related(*select).filter(
                user=user, chronicle=chronicle
            )

        if not characters.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        elif characters.count() > 1:
            return Response(status=status.HTTP_300_MULTIPLE_CHOICES)

        character = get_derived_instance(characters[0])
        Serializer = get_serializer(character.splat)

        return Response(data=Serializer(character).data)
