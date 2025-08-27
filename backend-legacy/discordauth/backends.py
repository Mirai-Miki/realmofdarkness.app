from django.contrib.auth.backends import BaseBackend
from .models import User


class DiscordAuthBackend(BaseBackend):

    def authenticate(self, request, user_id=None):
        try:
            user = User._default_manager.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None

    def get_user(self, user_id):
        try:
            user = User._default_manager.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None

    def user_can_authenticate(self, user):
        return True
