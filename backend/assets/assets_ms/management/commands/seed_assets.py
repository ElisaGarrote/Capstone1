from django.core.management.base import BaseCommand
from django.utils import timezone
from assets_ms.models import Asset, Product
from decimal import Decimal
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed the database with 10 asset records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing assets before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing assets...'))
            Asset.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing assets cleared.'))

        # Check if products exist
        products = Product.objects.filter(is_deleted=False)
        if not products.exists():
            self.stdout.write(self.style.ERROR('No products found. Please seed products first using: python manage.py seed_products'))
            return

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Assets ==='))

        assets_data = self.get_assets_data(products)
        created_count = 0

        for asset_data in assets_data:
            # Check by serial number to avoid duplicates
            asset, created = Asset.objects.get_or_create(
                serial_number=asset_data['serial_number'],
                defaults=asset_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created asset: {asset.asset_id} - {asset.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Asset exists: {asset.asset_id}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Assets seeding complete: {created_count} created'))

    def get_assets_data(self, products):
        base_date = timezone.now().date()
        
        # Get specific products or use first available
        products_list = list(products[:5])  # Get first 5 products
        
        assets = []
        serial_counter = 1
        
        # Create 2 assets for each of the first 5 products (total 10 assets)
        for i, product in enumerate(products_list):
            for j in range(2):
                asset_num = (i * 2) + j + 1
                
                assets.append({
                    'product': product,
                    'status': 1,  # Available
                    'supplier': 1 if asset_num % 2 == 1 else 2,
                    'location': 1 if asset_num <= 5 else 2,
                    'name': f'{product.name} Unit {j + 1}',
                    'serial_number': f'SN{serial_counter:06d}',  # SN000001, SN000002, etc.
                    'warranty_expiration': base_date + timedelta(days=365 * (3 - (asset_num % 3))),  # 1-3 years
                    'order_number': f'ORD-2024-{serial_counter:04d}',
                    'purchase_date': base_date - timedelta(days=30 * asset_num),  # Staggered purchase dates
                    'purchase_cost': product.default_purchase_cost if product.default_purchase_cost else Decimal('999.99'),
                    'notes': f'Sample asset {asset_num} for {product.name}',
                })
                serial_counter += 1
        
        return assets

