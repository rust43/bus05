# Generated by Django 5.0.7 on 2024-08-02 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transport', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transport',
            name='license_plate',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]
