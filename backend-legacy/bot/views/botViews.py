from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from bot.models import Bot
from bot.serializers import BotSerializer, BotDeserializer
from .get_post import get_post


@csrf_exempt
def update_bot(request):
    data = get_post(request)
    bot_data = data["bot"]

    try:
        bot = Bot.objects.get(pk=bot_data["id"])
        bot_serializer = BotDeserializer(bot, data=bot_data, partial=True)
    except Bot.DoesNotExist:
        bot_serializer = BotDeserializer(data=bot_data)

    if bot_serializer.is_valid():
        bot = bot_serializer.save()
        return JsonResponse(BotSerializer(bot).data, status=200)
    else:
        return JsonResponse(bot_serializer.errors, status=400)
