from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse

from .get_post import get_post
from bot.models import InitiativeTracker20th
from bot.serializers import (
    InitiativeTracker20thSerializer,
    InitiativeTracker20thDeserializer,
)
from chronicle.models import Chronicle


@csrf_exempt
def init_set(request):
    data = get_post(request)

    # Map the request fields to what the serializer expects
    serializer_data = {
        "id": data["channel_id"],  # Map channel_id to id (primary key)
        "chronicle": data["chronicle_id"],  # Map chronicle_id to chronicle
        "data": data["tracker"],  # Map tracker object to data field
    }

    try:
        tracker = InitiativeTracker20th.objects.get(pk=data["channel_id"])
        tracker_serializer = InitiativeTracker20thDeserializer(
            tracker, data=serializer_data, partial=True
        )
    except InitiativeTracker20th.DoesNotExist:
        tracker_serializer = InitiativeTracker20thDeserializer(data=serializer_data)

    if tracker_serializer.is_valid():
        tracker = tracker_serializer.save()
        return JsonResponse(InitiativeTracker20thSerializer(tracker).data, status=200)
    else:
        return JsonResponse(tracker_serializer.errors, status=400)


@csrf_exempt
def init_get(request):
    data = get_post(request)
    try:
        tracker = InitiativeTracker20th.objects.get(pk=data["channel_id"])
    except InitiativeTracker20th.DoesNotExist:
        return HttpResponse(status=204)

    return JsonResponse({"tracker": tracker.data})


@csrf_exempt
def init_delete(request):
    data = get_post(request)
    try:
        tracker = InitiativeTracker20th.objects.get(pk=data["channel_id"])
    except InitiativeTracker20th.DoesNotExist:
        return HttpResponse(status=204)

    tracker.delete()
    return HttpResponse()
