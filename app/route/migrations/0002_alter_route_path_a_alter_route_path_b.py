# Generated by Django 5.0.4 on 2024-05-19 14:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0001_initial'),
        ('route', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='route',
            name='path_a',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='path_a', to='map.mapobject'),
        ),
        migrations.AlterField(
            model_name='route',
            name='path_b',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='path_b', to='map.mapobject'),
        ),
    ]
