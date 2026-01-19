from django.core.management.base import BaseCommand
from django.db import connection
from contexts_ms.models import Depreciation
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed the database with depreciation records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing depreciations before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing depreciations...'))
            table_name = Depreciation._meta.db_table
            with connection.cursor() as cursor:
                cursor.execute(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE')
            self.stdout.write(self.style.SUCCESS('Existing depreciations cleared (IDs reset to 1).'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Depreciations ==='))

        depreciations_data = self.get_depreciations_data()
        created_count = 0

        for depreciation_data in depreciations_data:
            depreciation, created = Depreciation.objects.get_or_create(
                name=depreciation_data['name'],
                defaults=depreciation_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {depreciation.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Depreciation exists: {depreciation.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Depreciations seeding complete: {created_count} created'))

    def get_depreciations_data(self):
        """Generate 10 depreciation schedules for different asset types"""
        return [
            # ID 1: Standard IT Equipment (3 years)
            {'name': 'IT Equipment - 3 Year', 'duration': 36, 'minimum_value': Decimal('100.00')},
            # ID 2: Laptops/Portable (3 years)
            {'name': 'Laptops & Portables - 3 Year', 'duration': 36, 'minimum_value': Decimal('150.00')},
            # ID 3: Desktop Computers (4 years)
            {'name': 'Desktop Computers - 4 Year', 'duration': 48, 'minimum_value': Decimal('100.00')},
            # ID 4: Monitors & Displays (5 years)
            {'name': 'Monitors & Displays - 5 Year', 'duration': 60, 'minimum_value': Decimal('50.00')},
            # ID 5: Network Equipment (5 years)
            {'name': 'Network Equipment - 5 Year', 'duration': 60, 'minimum_value': Decimal('200.00')},
            # ID 6: Servers (5 years)
            {'name': 'Servers - 5 Year', 'duration': 60, 'minimum_value': Decimal('500.00')},
            # ID 7: Printers (4 years)
            {'name': 'Printers & Scanners - 4 Year', 'duration': 48, 'minimum_value': Decimal('75.00')},
            # ID 8: Furniture (7 years)
            {'name': 'Office Furniture - 7 Year', 'duration': 84, 'minimum_value': Decimal('50.00')},
            # ID 9: Vehicles (5 years)
            {'name': 'Vehicles - 5 Year', 'duration': 60, 'minimum_value': Decimal('1000.00')},
            # ID 10: General Equipment (3 years)
            {'name': 'General Equipment - 3 Year', 'duration': 36, 'minimum_value': Decimal('50.00')},
        ]
