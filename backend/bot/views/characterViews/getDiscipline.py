from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from haven.models import Vampire5th
from ..Authenticate import authenticate


class GetDisciplineNames(APIView):
    @csrf_exempt
    def post(self, request):
        authenticate(request)
        user_id = request.data.get("user_id", None)
        guild_id = request.data.get("guild_id", None)

        if guild_id:
            vampires = Vampire5th.objects.filter(
                user=user_id, chronicle=guild_id, is_sheet=True
            )
        else:
            vampires = Vampire5th.objects.filter(user=user_id, is_sheet=True)

        disciplines = []
        for sheet in vampires:
            for discipline in sheet.disciplines.keys():
                if discipline not in disciplines:
                    disciplines.append(discipline)

        return Response(data={"names": disciplines})
