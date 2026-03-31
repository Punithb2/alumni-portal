# Generated manually for adding type field to Club model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_connectionrequest_notification_metadata'),
    ]

    operations = [
        migrations.AddField(
            model_name='club',
            name='type',
            field=models.CharField(
                choices=[
                    ('Interest Group', 'Interest Group'),
                    ('Chapter', 'Chapter'),
                    ('Cohort', 'Cohort')
                ],
                default='Interest Group',
                max_length=50
            ),
        ),
    ]
