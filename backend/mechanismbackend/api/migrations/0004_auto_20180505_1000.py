# Generated by Django 2.0.4 on 2018-05-05 10:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20180503_0941'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputRotationX',
            new_name='inputR1',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputRotationY',
            new_name='inputR2',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputRotationZ',
            new_name='inputR3',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputTranslationX',
            new_name='inputT1',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputTranslationY',
            new_name='inputT2',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='inputTranslationZ',
            new_name='inputT3',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputRotationX',
            new_name='outputR1',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputRotationY',
            new_name='outputR2',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputRotationZ',
            new_name='outputR3',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputTranslationX',
            new_name='outputT1',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputTranslationY',
            new_name='outputT2',
        ),
        migrations.RenameField(
            model_name='mechanism',
            old_name='outputTranslationZ',
            new_name='outputT3',
        ),
    ]
