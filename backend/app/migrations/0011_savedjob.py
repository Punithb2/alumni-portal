from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_rename_app_connecti_recipie_c183d8_idx_app_connect_recipie_cca570_idx_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by_users', to='app.job')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_jobs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [
                    models.Index(fields=['user', 'created_at'], name='app_savedjo_user_id_dfd97b_idx'),
                    models.Index(fields=['job'], name='app_savedjo_job_id_79d3a2_idx'),
                ],
                'constraints': [
                    models.UniqueConstraint(fields=('user', 'job'), name='uniq_saved_job_per_user'),
                ],
            },
        ),
    ]
