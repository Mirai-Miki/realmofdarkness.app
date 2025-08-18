from django.urls import path
from .views.character_views import (
    BotCharacterView,
    BotCharacterNamesView,
    BotDisciplineNamesView,
    BotCharacterCountView,
)
from .views.chronicle_views import (
    ChronicleView,
    TrackerChannelView,
    StorytellerRoleView,
)
from .views.bot_views import BotView
from .views.user_views import UserView
from .views.initiative_views import InitiativeView
from .views.supporters import SupportersView
from .views.stats_views import StatsAPIView, CommandUsedAPIView
from .views.member_views import MemberView, DefaultCharacterView

app_name = "bot"
urlpatterns = [
    # Character
    path("character/get/<str:character_id>", BotCharacterView.as_view()),
    path("character/delete/<str:character_id>", BotCharacterView.as_view()),
    path("character/new", BotCharacterView.as_view()),
    path("character/save", BotCharacterView.as_view()),
    path("character/get/discipline/names", BotDisciplineNamesView.as_view()),
    path("character/get/names", BotCharacterNamesView.as_view()),
    path("character/count", BotCharacterCountView.as_view()),
    # Chronicle
    path("chronicle/get/<str:chronicle_id>", ChronicleView.as_view()),
    path("chronicle/delete/<str:chronicle_id>", ChronicleView.as_view()),
    path("chronicle/set", ChronicleView.as_view()),
    # Chronicle Tracker Channel
    path(
        "chronicle/tracker_channel/get/<str:chronicle_id>", TrackerChannelView.as_view()
    ),
    path("chronicle/tracker_channel/set", TrackerChannelView.as_view()),
    # Chronicle Storyteller Roles
    path(
        "chronicle/storyteller_roles/get/<str:chronicle_id>",
        StorytellerRoleView.as_view(),
    ),
    path(
        "chronicle/storyteller_roles/delete/<str:chronicle_id>",
        StorytellerRoleView.as_view(),
    ),
    path("chronicle/storyteller_roles/set", StorytellerRoleView.as_view()),
    # Member management
    path("member/get", MemberView.as_view()),  # GET
    path("member/set", MemberView.as_view()),  # POST for create/update
    path("member/delete", MemberView.as_view()),  # DELETE
    path("member/defaults/set", DefaultCharacterView.as_view()),  # POST
    path("member/defaults/get", DefaultCharacterView.as_view()),  # GET
    # User
    path("user/get/<str:user_id>", UserView.as_view()),  # GET with user_id in path
    path("user/set", UserView.as_view()),  # POST for create/update (user data only)
    # Supporters
    path("supporters", SupportersView.as_view()),  # GET all supporters
    # Initiative Tracker
    path("initiative/set", InitiativeView.as_view()),
    path("initiative/get", InitiativeView.as_view()),
    path("initiative/delete", InitiativeView.as_view()),
    # Stats
    path("stats/get", StatsAPIView.as_view()),  # GET with optional ?days=
    path("stats/command/update", CommandUsedAPIView.as_view()),  # POST JSON
    # Bot Info
    path("data/set", BotView.as_view()),
]
