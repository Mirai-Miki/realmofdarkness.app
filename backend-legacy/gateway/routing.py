# haven/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path("gateway/web", consumers.GatewayConsumer.as_asgi()),
]
