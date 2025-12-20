from django.core.management.base import BaseCommand
from contexts_ms.models import Depreciation
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed the database with 50 depreciation records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing depreciations before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing depreciations...'))
            Depreciation.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing depreciations cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding 50 Depreciations ==='))

        depreciations_data = self.get_depreciations_data()
        created_count = 0

        for depreciation_data in depreciations_data:
            depreciation, created = Depreciation.objects.get_or_create(
                name=depreciation_data['name'],
                defaults=depreciation_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Created: {depreciation.name} ({depreciation.duration} months, min: ₱{depreciation.minimum_value})'
                ))
            else:
                self.stdout.write(self.style.WARNING(f'- Depreciation exists: {depreciation.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Depreciations seeding complete: {created_count} created'))

    def get_depreciations_data(self):
        """Generate 50 realistic depreciation schedules covering common asset groups."""

        # Mix of IT equipment, AV, furniture, appliances, and specialist equipment
        items = [
            ('Laptops - Business Standard', 36, '2000.00'),
            ('Laptops - Premium', 48, '3000.00'),
            ('Desktops - Office', 48, '1500.00'),
            ('Desktops - High Performance', 60, '3500.00'),
            ('Servers - Rackmount (Enterprise)', 60, '10000.00'),
            ('Servers - Small Business', 60, '7000.00'),
            ('Network Switches - Managed', 60, '2500.00'),
            ('Network Routers - Enterprise', 60, '3000.00'),
            ('Firewalls & Security Appliances', 60, '4000.00'),
            ('Storage Arrays / SAN', 60, '15000.00'),
            ('Wireless Access Points', 48, '800.00'),
            ('Monitors - Standard 24"', 48, '300.00'),
            ('Monitors - Large/Professional', 60, '800.00'),
            ('Docking Stations', 36, '150.00'),
            ('Keyboards & Mice (Peripherals)', 24, '50.00'),
            ('Printers - Office Laser', 36, '1000.00'),
            ('Multi-function Printers / Copiers', 60, '5000.00'),
            ('Scanners - Document', 36, '700.00'),
            ('Projectors - Conference Room', 60, '4000.00'),
            ('Audio Systems / PA', 60, '6000.00'),
            ('Conference Cameras / VC Equipment', 48, '2500.00'),
            ('Mobile Devices - Smartphones', 24, '300.00'),
            ('Tablets - Business', 36, '600.00'),
            ('UPS & Power Backup', 60, '1200.00'),
            ('Batteries / Consumable Power Modules', 24, '200.00'),
            ('CCTV / Surveillance Cameras', 60, '1200.00'),
            ('Access Control Hardware', 60, '2500.00'),
            ('Point-of-Sale Terminals', 48, '1800.00'),
            ('Barcode Scanners / POS Peripherals', 36, '250.00'),
            ('Voice/Telephony Systems', 60, '3000.00'),
            ('Conference Room Furniture', 120, '5000.00'),
            ('Office Furniture - Desks/Chairs', 120, '2000.00'),
            ('Warehouse Racking (IT-related)', 120, '8000.00'),
            ('Lab / Test Equipment', 60, '8000.00'),
            ('Medical Devices - Small', 60, '7000.00'),
            ('Industrial Controllers / PLCs', 84, '6000.00'),
            ('HVAC Controls / Sensors', 120, '3500.00'),
            ('3D Printers / Prototyping', 60, '4500.00'),
            ('Specialist Cameras / Photo Gear', 60, '3000.00'),
            ('External Storage / NAS', 60, '2000.00'),
            ('External Backup Drives', 36, '400.00'),
            ('Software Licenses - Perpetual (amortized)', 36, '2500.00'),
            ('Software Subscriptions (capitalized)', 24, '1200.00'),
            ('AV Cabling & Installation (capital)', 60, '1500.00'),
            ('UPS Installation & Racking', 60, '2500.00'),
            ('Telecom Infrastructure', 84, '10000.00'),
            ('Electric Vehicle Charging Stations (site)', 120, '12000.00'),
            ('Specialist Measurement Instruments', 84, '9000.00'),
            ('Miscellaneous Accessories (capital)', 36, '150.00'),
        ]

        depreciations = []
        for name, duration, minval in items:
            depreciations.append({
                'name': name,
                'duration': int(duration),
                'minimum_value': Decimal(minval),
            })

        # Ensure we have exactly 50 entries; if fewer, add numbered variants
        if len(depreciations) < 50:
            base_count = len(depreciations)
            i = 1
            while len(depreciations) < 50:
                # Create unique variants by appending a short suffix
                base = depreciations[(i - 1) % base_count]
                candidate_name = f"{base['name']} - Variant {i}"
                depreciations.append({
                    'name': candidate_name,
                    'duration': base['duration'],
                    'minimum_value': base['minimum_value'],
                })
                i += 1

        # Trim to exactly 50 (in case items was accidentally longer)
        return depreciations[:50]

