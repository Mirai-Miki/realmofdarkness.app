from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from haven.models import Vampire5th
from ..Authenticate import authenticate

from haven.serializers import Vampire5thSerializer


class GetSheet(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)

        name = request.data.get("name", None)
        user = request.data.get("user", None)
        chronicle = request.data.get("chronicle", None)
        characters = None
        if not user:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if name:
            characters = Vampire5th.objects.filter(user=user, name=name)
        else:
            characters = Vampire5th.objects.filter(
                user=user, chronicle=chronicle, is_sheet=True
            )

        if not characters.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        elif characters.count() > 1:
            return Response(status=status.HTTP_300_MULTIPLE_CHOICES)

        character = characters[0]  # pull the character from the queryset
        if not character.is_sheet:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        json = Vampire5thSerializer(character).data
        return Response(data=json)


class GetVampireSheetNames(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)

        user_id = request.data.get("user_id", None)
        chronicle_id = request.data.get("guild_id", None)

        if chronicle_id:
            sheets = Vampire5th.objects.filter(
                user=user_id, chronicle=chronicle_id, is_sheet=True
            )
        else:
            sheets = Vampire5th.objects.filter(user=user_id, is_sheet=True)

        names = []
        for character in sheets:
            names.append(character.name)
        return Response(data={"names": names})
