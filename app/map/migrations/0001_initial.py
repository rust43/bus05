# Generated by Django 5.0.7 on 2024-08-22 19:59

import django.contrib.gis.db.models.fields
import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MapObject',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ObjectType',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='MapObjectProp',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('prop', models.CharField(blank=True, max_length=255, null=True)),
                ('value', models.CharField(blank=True, max_length=255, null=True)),
                ('map_object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='props', to='map.mapobject')),
            ],
        ),
        migrations.CreateModel(
            name='ObjectCircle',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('geom', django.contrib.gis.db.models.fields.PointField(blank=True, geography=True, null=True, srid=4326)),
                ('map_object', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='circle', to='map.mapobject')),
            ],
        ),
        migrations.CreateModel(
            name='ObjectLineString',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('geom', django.contrib.gis.db.models.fields.LineStringField(blank=True, geography=True, null=True, srid=4326)),
                ('map_object', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='line', to='map.mapobject')),
            ],
        ),
        migrations.CreateModel(
            name='ObjectPoint',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('geom', django.contrib.gis.db.models.fields.PointField(blank=True, geography=True, null=True, srid=4326, verbose_name='точка')),
                ('map_object', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='point', to='map.mapobject')),
            ],
        ),
        migrations.CreateModel(
            name='ObjectPolygon',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('geom', django.contrib.gis.db.models.fields.PolygonField(blank=True, geography=True, null=True, srid=4326)),
                ('map_object', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='polygon', to='map.mapobject')),
            ],
        ),
        migrations.AddField(
            model_name='mapobject',
            name='object_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='map.objecttype'),
        ),
    ]
