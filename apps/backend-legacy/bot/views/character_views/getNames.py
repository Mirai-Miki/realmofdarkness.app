from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from haven.models import Character
from ..Authenticate import authenticate


class GetNames(APIView):
    """
    API view for retrieving character names, IDs, and splats based on specified filters.

    This view accepts a POST request and expects the following parameters in the request data:
    - user_id: The ID of the user.
    - guild_id: The ID of the guild/chronicle.
    - splat: The splat (character type) to filter by.
    - sheet_only: A boolean indicating whether to filter only characters with a character sheet.

    The view returns a JSON response containing a list of character names, IDs, and splats that match the specified filters.
    """

    @csrf_exempt
    def post(self, request):
        authenticate(request)

        user_id = request.data.get("user_id", None)
        chronicle_id = request.data.get("guild_id", None)
        splat = request.data.get("splat", None)
        sheet_only = request.data.get("sheet_only", False)

        filter_args = {"user": user_id}
        if sheet_only:
            filter_args["is_sheet"] = True
        if chronicle_id:
            filter_args["chronicle"] = chronicle_id

        if splat:
            if isinstance(splat, str):
                splat_list = [splat]
            elif isinstance(splat, list):
                splat_list = splat
            else:
                splat_list = []

            if splat_list:
                characters = Character.objects.filter(
                    splat__in=splat_list, **filter_args
                ).values("id", "name", "splat")
        else:
            characters = Character.objects.filter(**filter_args).values(
                "id", "name", "splat"
            )

        return Response(data={"characters": list(characters)})
