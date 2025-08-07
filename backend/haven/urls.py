"""
URL Configuration for Haven app.

This module defines URL patterns for character management endpoints.
Simple APIView-based endpoints for public character operations.
"""

from django.urls import path

from .views import CharacterView

# Character management endpoints
urlpatterns = [
    # Character CRUD endpoints - ID required for GET, optional for POST
    path("character/", CharacterView.as_view(), name="character-create"),
    path(
        "character/<str:character_id>/",
        CharacterView.as_view(),
        name="character-detail",
    ),
]
