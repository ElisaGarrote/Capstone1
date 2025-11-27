from django.core.management.base import BaseCommand
from contexts_ms.models import Manufacturer


class Command(BaseCommand):
    help = 'Seed the database with 10 manufacturer records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing manufacturers before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing manufacturers...'))
            Manufacturer.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing manufacturers cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding 10 Manufacturers ==='))

        manufacturers_data = self.get_manufacturers_data()
        created_count = 0

        for manufacturer_data in manufacturers_data:
            manufacturer, created = Manufacturer.objects.get_or_create(
                name=manufacturer_data['name'],
                defaults=manufacturer_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {manufacturer.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Manufacturer exists: {manufacturer.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Manufacturers seeding complete: {created_count} created'))

    def get_manufacturers_data(self):
        """Generate 10 major IT equipment manufacturers

        Note: support_phone field is limited to 13 characters in the database
        """

        manufacturers = [
            {
                'name': 'Dell Technologies',
                'manu_url': 'https://www.dell.com',
                'support_url': 'https://www.dell.com/support',
                'support_phone': '800-624-9896',
                'support_email': 'support@dell.com',
                'notes': 'Leading manufacturer of laptops, desktops, and servers',
            },
            {
                'name': 'HP Inc.',
                'manu_url': 'https://www.hp.com',
                'support_url': 'https://support.hp.com',
                'support_phone': '800-474-6836',
                'support_email': 'support@hp.com',
                'notes': 'Computers, printers, and enterprise solutions',
            },
            {
                'name': 'Lenovo',
                'manu_url': 'https://www.lenovo.com',
                'support_url': 'https://support.lenovo.com',
                'support_phone': '855-253-6686',
                'support_email': 'support@lenovo.com',
                'notes': 'ThinkPad, ThinkCentre, and IdeaPad product lines',
            },
            {
                'name': 'Apple Inc.',
                'manu_url': 'https://www.apple.com',
                'support_url': 'https://support.apple.com',
                'support_phone': '800-275-2273',
                'support_email': 'support@apple.com',
                'notes': 'MacBook, iMac, Mac Pro, and accessories',
            },
            {
                'name': 'ASUS',
                'manu_url': 'https://www.asus.com',
                'support_url': 'https://www.asus.com/support',
                'support_phone': '888-678-3688',
                'support_email': 'support@asus.com',
                'notes': 'Laptops, motherboards, and computer components',
            },
            {
                'name': 'Cisco Systems',
                'manu_url': 'https://www.cisco.com',
                'support_url': 'https://www.cisco.com/c/en/us/support',
                'support_phone': '800-553-2447',
                'support_email': 'support@cisco.com',
                'notes': 'Network equipment, switches, routers, and firewalls',
            },
            {
                'name': 'Ubiquiti Networks',
                'manu_url': 'https://www.ui.com',
                'support_url': 'https://help.ui.com',
                'support_phone': '408-942-4140',
                'support_email': 'support@ui.com',
                'notes': 'UniFi network equipment and wireless solutions',
            },
            {
                'name': 'Samsung Electronics',
                'manu_url': 'https://www.samsung.com',
                'support_url': 'https://www.samsung.com/support',
                'support_phone': '800-726-7864',
                'support_email': 'support@samsung.com',
                'notes': 'Monitors, SSDs, memory, and mobile devices',
            },
            {
                'name': 'LG Electronics',
                'manu_url': 'https://www.lg.com',
                'support_url': 'https://www.lg.com/support',
                'support_phone': '800-243-0000',
                'support_email': 'support@lg.com',
                'notes': 'Monitors and display solutions',
            },
            {
                'name': 'Canon Inc.',
                'manu_url': 'https://www.canon.com',
                'support_url': 'https://www.canon.com/support',
                'support_phone': '800-652-2666',
                'support_email': 'support@canon.com',
                'notes': 'Printers, scanners, and imaging equipment',
            },
        ]

        return manufacturers

