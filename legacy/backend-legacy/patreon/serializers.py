from rest_framework import serializers


class PatreonWebhookSerializer(serializers.Serializer):
    data = serializers.JSONField()
    included = serializers.JSONField()
