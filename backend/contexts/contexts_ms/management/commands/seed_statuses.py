from django.core.management.base import BaseCommand
from django.db import connection
from contexts_ms.models import Status


class Command(BaseCommand):
    help = 'Seed the database with status records (10 asset statuses + 5 repair statuses)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing statuses before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing statuses...'))
            table_name = Status._meta.db_table
            with connection.cursor() as cursor:
                cursor.execute(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE')
            self.stdout.write(self.style.SUCCESS('Existing statuses cleared (IDs reset to 1).'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Statuses ==='))

        statuses_data = self.get_statuses_data()
        created_count = 0

        for status_data in statuses_data:
            # Use category, name, and type (if asset) for uniqueness
            lookup = {
                'name': status_data['name'],
                'category': status_data['category'],
            }
            if status_data.get('type'):
                lookup['type'] = status_data['type']

            status, created = Status.objects.get_or_create(
                **lookup,
                defaults=status_data
            )
            if created:
                created_count += 1
                category_display = status.get_category_display()
                type_display = f" ({status.get_type_display()})" if status.type else ""
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {status.name} [{category_display}]{type_display}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Status exists: {status.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Statuses seeding complete: {created_count} created'))

    def get_statuses_data(self):
        """Generate statuses: 10 asset statuses (2 per type) + 5 repair statuses"""
        # Create 20 asset statuses and 10 repair statuses for seeding
        statuses = [
            # ASSET STATUSES (20)
            {'category': Status.Category.ASSET, 'name': 'Ready to Deploy', 'type': Status.AssetStatusType.DEPLOYABLE, 'notes': 'Asset ready for assignment.'},
            {'category': Status.Category.ASSET, 'name': 'Available', 'type': Status.AssetStatusType.DEPLOYABLE, 'notes': 'Available in inventory.'},
            {'category': Status.Category.ASSET, 'name': 'In Use', 'type': Status.AssetStatusType.DEPLOYED, 'notes': 'Assigned to a user.'},
            {'category': Status.Category.ASSET, 'name': 'Checked Out', 'type': Status.AssetStatusType.DEPLOYED, 'notes': 'Checked out to staff.'},
            {'category': Status.Category.ASSET, 'name': 'Under Repair', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Currently under repair.'},
            {'category': Status.Category.ASSET, 'name': 'Broken', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Requires replacement or repair.'},
            {'category': Status.Category.ASSET, 'name': 'Pending Approval', 'type': Status.AssetStatusType.PENDING, 'notes': 'Awaiting approval for use.'},
            {'category': Status.Category.ASSET, 'name': 'In Transit', 'type': Status.AssetStatusType.PENDING, 'notes': 'Being transferred between locations.'},
            {'category': Status.Category.ASSET, 'name': 'Retired', 'type': Status.AssetStatusType.ARCHIVED, 'notes': 'Retired from active service.'},
            {'category': Status.Category.ASSET, 'name': 'Lost or Stolen', 'type': Status.AssetStatusType.ARCHIVED, 'notes': 'Marked as lost or stolen.'},
            {'category': Status.Category.ASSET, 'name': 'Maintenance', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Scheduled maintenance.'},
            {'category': Status.Category.ASSET, 'name': 'Reserved', 'type': Status.AssetStatusType.DEPLOYABLE, 'notes': 'Reserved for a future assignment.'},
            {'category': Status.Category.ASSET, 'name': 'Awaiting Calibration', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Requires calibration before use.'},
            {'category': Status.Category.ASSET, 'name': 'Calibration Due', 'type': Status.AssetStatusType.PENDING, 'notes': 'Calibration is due soon.'},
            {'category': Status.Category.ASSET, 'name': 'Warranty', 'type': Status.AssetStatusType.DEPLOYABLE, 'notes': 'Covered under warranty.'},
            {'category': Status.Category.ASSET, 'name': 'Out for Service', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Sent to external service provider.'},
            {'category': Status.Category.ASSET, 'name': 'Quarantined', 'type': Status.AssetStatusType.UNDEPLOYABLE, 'notes': 'Isolated due to issues.'},
            {'category': Status.Category.ASSET, 'name': 'Decommissioned', 'type': Status.AssetStatusType.ARCHIVED, 'notes': 'Decommissioned and removed.'},
            {'category': Status.Category.ASSET, 'name': 'Replacement Pending', 'type': Status.AssetStatusType.PENDING, 'notes': 'Replacement has been requested.'},
            {'category': Status.Category.ASSET, 'name': 'Inspection Required', 'type': Status.AssetStatusType.PENDING, 'notes': 'Requires safety inspection.'},

            # REPAIR STATUSES (10)
            {'category': Status.Category.REPAIR, 'name': 'Repair Pending', 'type': None, 'notes': 'Repair request logged and pending.'},
            {'category': Status.Category.REPAIR, 'name': 'In Repair', 'type': None, 'notes': 'Currently being repaired.'},
            {'category': Status.Category.REPAIR, 'name': 'Awaiting Parts', 'type': None, 'notes': 'Waiting for replacement parts.'},
            {'category': Status.Category.REPAIR, 'name': 'Repair Completed', 'type': None, 'notes': 'Repair work finished.'},
            {'category': Status.Category.REPAIR, 'name': 'Repair Cancelled', 'type': None, 'notes': 'Repair request was cancelled.'},
            {'category': Status.Category.REPAIR, 'name': 'Awaiting Approval', 'type': None, 'notes': 'Repair estimate awaiting approval.'},
            {'category': Status.Category.REPAIR, 'name': 'Diagnosed', 'type': None, 'notes': 'Fault diagnosed; awaiting next steps.'},
            {'category': Status.Category.REPAIR, 'name': 'On Hold', 'type': None, 'notes': 'Repair is temporarily on hold.'},
            {'category': Status.Category.REPAIR, 'name': 'Parts Ordered', 'type': None, 'notes': 'Parts for repair have been ordered.'},
            {'category': Status.Category.REPAIR, 'name': 'Returned to Service', 'type': None, 'notes': 'Item returned to service after repair.'},
        ]

        return statuses
