from django.core.management.base import BaseCommand
from django.utils import timezone
from assets_ms.models import Product
from decimal import Decimal
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed the database with 10 product records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing products...'))
            Product.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing products cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Products ==='))

        products_data = self.get_products_data()
        created_count = 0

        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                model_number=product_data['model_number'],
                defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created product: {product.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Product exists: {product.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Products seeding complete: {created_count} created'))

    def get_products_data(self):
        base_date = timezone.now().date()
        
        return [
            # Laptops
            {
                'name': 'Dell Latitude 5420',
                'category': 1,
                'manufacturer': 15,  # Dell
                'depreciation': 1,
                'model_number': 'LAT-5420',
                'end_of_life': base_date + timedelta(days=1825),  # 5 years
                'default_purchase_cost': Decimal('1299.99'),
                'minimum_quantity': 5,
                'cpu': 'Intel Core i5-1135G7',
                'gpu': 'Intel Iris Xe Graphics',
                'os': 'Windows 11 Pro',
                'ram': '16GB DDR4',
                'storage': '512GB NVMe SSD',
                'notes': 'Standard business laptop for office work',
            },
            {
                'name': 'HP EliteBook 840 G8',
                'category': 1,
                'manufacturer': 14,  # HP
                'depreciation': 1,
                'model_number': 'EB-840G8',
                'end_of_life': base_date + timedelta(days=1825),
                'default_purchase_cost': Decimal('1499.99'),
                'minimum_quantity': 3,
                'cpu': 'Intel Core i7-1165G7',
                'gpu': 'Intel Iris Xe Graphics',
                'os': 'Windows 11 Pro',
                'ram': '16GB DDR4',
                'storage': '512GB NVMe SSD',
                'notes': 'Premium business laptop with enhanced security',
            },
            {
                'name': 'Lenovo ThinkPad X1 Carbon Gen 9',
                'category': 1,
                'manufacturer': 19,  # Lenovo
                'depreciation': 1,
                'model_number': 'X1C-G9',
                'end_of_life': base_date + timedelta(days=1825),
                'default_purchase_cost': Decimal('1799.99'),
                'minimum_quantity': 2,
                'cpu': 'Intel Core i7-1185G7',
                'gpu': 'Intel Iris Xe Graphics',
                'os': 'Windows 11 Pro',
                'ram': '16GB LPDDR4X',
                'storage': '1TB NVMe SSD',
                'notes': 'Ultra-portable premium laptop for executives',
            },
            # Desktops
            {
                'name': 'HP EliteDesk 800 G6',
                'category': 2,
                'manufacturer': 14,  # HP
                'depreciation': 1,
                'model_number': 'ED-800G6',
                'end_of_life': base_date + timedelta(days=1825),
                'default_purchase_cost': Decimal('899.99'),
                'minimum_quantity': 4,
                'cpu': 'Intel Core i7-10700',
                'gpu': 'Intel UHD Graphics 630',
                'os': 'Windows 11 Pro',
                'ram': '32GB DDR4',
                'storage': '1TB NVMe SSD',
                'notes': 'Desktop workstation for power users',
            },
            {
                'name': 'Dell OptiPlex 7090',
                'category': 2,
                'manufacturer': 15,  # Dell
                'depreciation': 1,
                'model_number': 'OPT-7090',
                'end_of_life': base_date + timedelta(days=1825),
                'default_purchase_cost': Decimal('1099.99'),
                'minimum_quantity': 3,
                'cpu': 'Intel Core i7-11700',
                'gpu': 'Intel UHD Graphics 750',
                'os': 'Windows 11 Pro',
                'ram': '32GB DDR4',
                'storage': '512GB NVMe SSD',
                'notes': 'Compact desktop for office environments',
            },
            # Monitors
            {
                'name': 'Dell UltraSharp U2720Q',
                'category': 3,
                'manufacturer': 15,  # Dell
                'model_number': 'U2720Q',
                'end_of_life': base_date + timedelta(days=1095),  # 3 years
                'default_purchase_cost': Decimal('549.99'),
                'minimum_quantity': 10,
                'size': '27-inch 4K',
                'notes': '27-inch 4K USB-C monitor with excellent color accuracy',
            },
            {
                'name': 'LG 27UK850-W',
                'category': 3,
                'manufacturer': 12,  # LG (assuming manufacturer ID)
                'model_number': 'LG-27UK850',
                'end_of_life': base_date + timedelta(days=1095),
                'default_purchase_cost': Decimal('499.99'),
                'minimum_quantity': 8,
                'size': '27-inch 4K',
                'notes': '27-inch 4K monitor with HDR10 support',
            },
            # Network Equipment
            {
                'name': 'Cisco Catalyst 2960-X',
                'category': 4,
                'manufacturer': 27,  # Cisco
                'model_number': 'WS-C2960X-24TS-L',
                'end_of_life': base_date + timedelta(days=2555),  # 7 years
                'default_purchase_cost': Decimal('1899.99'),
                'minimum_quantity': 2,
                'notes': '24-port managed gigabit switch with Layer 2 features',
            },
            {
                'name': 'Ubiquiti UniFi Dream Machine Pro',
                'category': 4,
                'manufacturer': 28,  # Ubiquiti
                'model_number': 'UDM-PRO',
                'end_of_life': base_date + timedelta(days=1825),
                'default_purchase_cost': Decimal('379.99'),
                'minimum_quantity': 3,
                'notes': 'All-in-one network security gateway and controller',
            },
            # Printers
            {
                'name': 'HP LaserJet Pro M404dn',
                'category': 5,
                'manufacturer': 14,  # HP
                'model_number': 'M404DN',
                'end_of_life': base_date + timedelta(days=1460),  # 4 years
                'default_purchase_cost': Decimal('299.99'),
                'minimum_quantity': 5,
                'notes': 'Monochrome laser printer with duplex printing',
            },
        ]

