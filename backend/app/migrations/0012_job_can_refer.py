from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0011_savedjob'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='can_refer',
            field=models.BooleanField(default=False),
        ),
    ]
