# Generated migration to clear all user sessions
from django.db import migrations


def clear_all_sessions(apps, schema_editor):
    """Clear all existing sessions to force users to re-login"""
    try:
        # Try to clear database sessions (default Django behavior)
        from django.contrib.sessions.models import Session

        Session.objects.all().delete()
        print("Database sessions cleared successfully")
    except Exception as e:
        print(f"Could not clear database sessions: {e}")


def reverse_clear_sessions(apps, schema_editor):
    """Reverse migration - no-op since we can't restore deleted sessions"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("discordauth", "0009_increment_supporter_tiers"),
    ]

    operations = [
        migrations.RunPython(clear_all_sessions, reverse_clear_sessions),
    ]
