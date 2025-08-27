from django.urls import path
from .views import PatreonWebhookView

app_name = "patreon"
urlpatterns = [
    path("webhook", PatreonWebhookView.as_view(), name="patreon_webhook"),
]
