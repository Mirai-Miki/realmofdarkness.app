from django.urls import path
from .views import *

app_name = "api"
urlpatterns = [
    path("character/new/v5", CharacterSheetCreateV5.as_view()),
    path("character/get/v5", GetV5Character.as_view()),
    path("character/update/v5/<int:id>", CharacterUpdateV5.as_view()),
    path("character/delete", DeleteCharacter.as_view()),
]
