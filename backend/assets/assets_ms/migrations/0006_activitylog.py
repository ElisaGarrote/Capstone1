# Generated manually for ActivityLog model

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assets_ms', '0005_add_asset_report_template'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datetime', models.DateTimeField(default=django.utils.timezone.now)),
                ('user_id', models.PositiveIntegerField()),
                ('user_name', models.CharField(blank=True, max_length=200, null=True)),
                ('activity_type', models.CharField(choices=[
                    ('Asset', 'Asset'),
                    ('Component', 'Component'),
                    ('Audit', 'Audit'),
                    ('Repair', 'Repair'),
                ], max_length=20)),
                ('action', models.CharField(choices=[
                    ('Create', 'Create'),
                    ('Update', 'Update'),
                    ('Delete', 'Delete'),
                    ('Checkout', 'Checkout'),
                    ('Checkin', 'Checkin'),
                    ('Schedule', 'Schedule'),
                    ('Passed', 'Passed'),
                    ('Failed', 'Failed'),
                ], max_length=20)),
                ('item_id', models.PositiveIntegerField()),
                ('item_identifier', models.CharField(blank=True, max_length=100, null=True)),
                ('item_name', models.CharField(blank=True, max_length=200, null=True)),
                ('target_id', models.PositiveIntegerField(blank=True, null=True)),
                ('target_name', models.CharField(blank=True, max_length=200, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-datetime'],
            },
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['-datetime'], name='assets_ms_a_datetim_e61a88_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['activity_type'], name='assets_ms_a_activit_3c5c7a_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['action'], name='assets_ms_a_action_8f3a1b_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['user_id'], name='assets_ms_a_user_id_7d2e4c_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['item_id'], name='assets_ms_a_item_id_9a1f5d_idx'),
        ),
    ]

