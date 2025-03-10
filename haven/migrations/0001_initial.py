# Generated by Django 3.2.5 on 2021-10-26 12:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chronicle', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Character',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=50)),
                ('partial', models.BooleanField(default=True)),
                ('date_created', models.DateField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('faceclaim', models.URLField(blank=True)),
                ('chronicle', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chronicle.chronicle')),
                ('member', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chronicle.member')),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(unique=True)),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='MoralityInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(unique=True)),
                ('name', models.CharField(db_index=True, max_length=50, unique=True)),
                ('conviction', models.BooleanField(default=False)),
                ('instinct', models.BooleanField(default=False)),
                ('referance', models.CharField(blank=True, max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Trackable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField()),
                ('total', models.IntegerField(null=True)),
                ('current', models.IntegerField(default=1)),
                ('character', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trackable', to='haven.character')),
            ],
        ),
        migrations.CreateModel(
            name='Splat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('version', models.CharField(max_length=20)),
                ('slug', models.SlugField(unique=True)),
                ('description', models.TextField(blank=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='haven.game')),
            ],
        ),
        migrations.CreateModel(
            name='Morality',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current', models.IntegerField(default=7)),
                ('character', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='haven.character')),
                ('morality_info', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='haven.moralityinfo')),
            ],
        ),
        migrations.CreateModel(
            name='Humanity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current', models.IntegerField(default=7)),
                ('stains', models.IntegerField(default=0)),
                ('character', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='haven.character')),
            ],
        ),
        migrations.CreateModel(
            name='History',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('args', models.CharField(blank=True, max_length=250)),
                ('notes', models.CharField(blank=True, max_length=150)),
                ('mode', models.CharField(blank=True, max_length=50)),
                ('character', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='haven.character')),
            ],
        ),
        migrations.CreateModel(
            name='Health20th',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField()),
                ('total', models.IntegerField(default=7)),
                ('bashing', models.IntegerField(default=0)),
                ('lethal', models.IntegerField(default=0)),
                ('aggravated', models.IntegerField(default=0)),
                ('character', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='health', to='haven.character')),
            ],
        ),
        migrations.CreateModel(
            name='Damage5th',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField()),
                ('total', models.IntegerField(default=1)),
                ('superficial', models.IntegerField(default=0)),
                ('aggravated', models.IntegerField(default=0)),
                ('character', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='damage', to='haven.character')),
            ],
        ),
        migrations.CreateModel(
            name='Colour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('red', models.IntegerField(default=0)),
                ('green', models.IntegerField(default=0)),
                ('blue', models.IntegerField(default=0)),
                ('character', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='haven.character')),
            ],
        ),
        migrations.AddField(
            model_name='character',
            name='splat',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='haven.splat'),
        ),
        migrations.AddField(
            model_name='character',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='trackable',
            index=models.Index(fields=['character', 'slug'], name='haven_track_charact_9aa687_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='trackable',
            unique_together={('character', 'slug')},
        ),
        migrations.AddIndex(
            model_name='damage5th',
            index=models.Index(fields=['character', 'slug'], name='haven_damag_charact_363f02_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='damage5th',
            unique_together={('character', 'slug')},
        ),
        migrations.AddIndex(
            model_name='character',
            index=models.Index(fields=['name', 'user'], name='haven_chara_name_544bf6_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='character',
            unique_together={('name', 'user')},
        ),
    ]
