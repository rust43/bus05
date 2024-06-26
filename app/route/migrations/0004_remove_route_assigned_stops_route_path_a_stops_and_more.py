# Generated by Django 5.0.4 on 2024-05-27 14:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('route', '0003_alter_busstop_location_alter_route_path_a_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='route',
            name='assigned_stops',
        ),
        migrations.AddField(
            model_name='route',
            name='path_a_stops',
            field=models.ManyToManyField(blank=True, related_name='path_a_stops', to='route.busstop'),
        ),
        migrations.AddField(
            model_name='route',
            name='path_b_stops',
            field=models.ManyToManyField(blank=True, related_name='path_b_stops', to='route.busstop'),
        ),
    ]
