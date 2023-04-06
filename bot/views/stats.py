from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.db.models import Count
from django.utils import timezone

from .get_post import get_post
from haven.models import Character
from bot.models import CommandStat, Bot

User = get_user_model()

@csrf_exempt
def get_stats(request):
  get_post(request)
  users = User.objects.all()

  # User Stats
  timestamp_30days = date.today() - timedelta(days=30)
  timestamp_14days = date.today() - timedelta(days=14)    
  users_30days = users.filter(last_active__gt=timestamp_30days)
  users_14days = users_30days.filter(last_active__gt=timestamp_14days)

  user_stats = {
    'total': str(users.count()),
    '30days': str(users_30days.count()),
    '14days': str(users_14days.count())
  }

  command_stats = CommandStat.objects.filter(last_used__gt=timestamp_30days)\
    .values('command', 'bot__username').order_by().annotate(count=Count('command'))\
    .order_by('-count')

  # Character Stats
  characters = Character.objects.filter(last_updated__gt=timestamp_30days)\
    .values('splat__name', 'splat__version', 'splat__slug')\
    .annotate(count=Count('splat__slug')).order_by('-count')
  
  char_stats = []
  for char in characters:
    char_stats.append({
      "count": char['count'],
      "splat": char['splat__name'] + ' ' + char['splat__version']
    })

  return JsonResponse({
    "users": user_stats, 
    'characters': char_stats,
    'command_stats': list(command_stats)
  })

@csrf_exempt
def command_used(request):
  data = get_post(request)
  user_id = data['user_id']
  command = data['command']
  bot_id = data['bot_id']

  user = User.objects.get(pk=user_id)
  bot = Bot.objects.get(pk=bot_id)

  try:
    stat = CommandStat.objects.get(user=user, command=command, bot=bot)
    stat.used += 1
  except CommandStat.DoesNotExist:
    stat = CommandStat(user=user, command=command, bot=bot)
  
  stat.save()
  user.last_active = timezone.now()
  user.save()
  return HttpResponse()