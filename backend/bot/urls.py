from django.urls import path
from . import views
from .views.character_views import (
    GetCharacter,
    GetDisciplineNames,
    GetNames,
    DeleteCharacters,
    NewCharacter,
    SaveCharacter,
    GetSheet,
)
from .views.chronicleViews import (
    MemberDeleteView,
    SetTrackerChannelView,
    GetTrackerChannelView,
    SetStorytellerRoleView,
    GetStorytellerRolesView,
    DeleteStorytellerRoleView,
    SetGuildView,
    DeleteGuildView,
    SetDefaultsView,
    GetDefaultsView,
)
from .views.botViews import update_bot
from .views.userViews import (
    get_supporter_level,
    set_supporter_level,
    update_user,
    get_admins_storytellers,
)
from .views.initiativeViews import init_set, init_get, init_delete
from .views.statsViews import StatsAPIView, CommandUsedAPIView

app_name = "bot"
urlpatterns = [
    # Character
    path("character/get", GetCharacter.as_view()),
    path("character/get/discipline/names", GetDisciplineNames.as_view()),
    path("character/get/names", GetNames.as_view()),
    path("character/delete", DeleteCharacters.as_view()),
    path("character/new", NewCharacter.as_view()),
    path("character/save", SaveCharacter.as_view()),
    # Sheet API
    path("sheet/get", views.GetSheet.as_view()),
    # Chronicle
    path("chronicle/set", SetGuildView.as_view()),
    path("chronicle/delete", DeleteGuildView.as_view()),
    path("chronicle/channel/set", SetTrackerChannelView.as_view()),
    path("chronicle/channel/get", GetTrackerChannelView.as_view()),
    path("chronicle/storyteller/roles/set", SetStorytellerRoleView.as_view()),
    path("chronicle/storyteller/roles/get", GetStorytellerRolesView.as_view()),
    path("chronicle/storyteller/roles/delete", DeleteStorytellerRoleView.as_view()),
    path("chronicle/member/delete", MemberDeleteView.as_view()),
    path("chronicle/member/defaults/set", SetDefaultsView.as_view()),
    path("chronicle/member/defaults/get", GetDefaultsView.as_view()),
    path("chronicle/storytellers/get", get_admins_storytellers),
    # User
    path("user/supporter/get", get_supporter_level),
    path("user/supporter/set", set_supporter_level),
    path("user/update", update_user),
    path("user/supporter/get_all", views.GetAllSupportersView.as_view()),
    # Initiative Tracker
    path("initiative/set", init_set),
    path("initiative/get", init_get),
    path("initiative/delete", init_delete),
    # Stats
    path("stats/get", StatsAPIView.as_view()),
    path("stats/command/update", CommandUsedAPIView.as_view()),
    # Bot Info
    path("data/set", update_bot),
]
