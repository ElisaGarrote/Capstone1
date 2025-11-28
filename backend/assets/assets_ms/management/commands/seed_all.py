from django.core.management.base import BaseCommand
from django.core.management import call_command
from assets_ms.models import Product


class Command(BaseCommand):
    help = 'Seed the database with all assets service data (100 products, 100 assets, 40 checkouts, 100 components)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
        parser.add_argument(
            '--products-only',
            action='store_true',
            help='Seed only products (100 records)',
        )
        parser.add_argument(
            '--assets-only',
            action='store_true',
            help='Seed only assets (100 records) - will also seed products if they don\'t exist',
        )
        parser.add_argument(
            '--components-only',
            action='store_true',
            help='Seed only components (100 records)',
        )
        parser.add_argument(
            '--checkouts-only',
            action='store_true',
            help='Seed only asset checkouts (40 records) - will also seed assets if they don\'t exist',
        )

    def handle(self, *args, **options):
        clear_flag = '--clear' if options['clear'] else ''

        # Seed Products (100 records)
        if not options['components_only'] and not options['assets_only'] and not options['checkouts_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Products (100 records) ==='))
            call_command('seed_products', clear_flag) if clear_flag else call_command('seed_products')

        # Seed Assets (100 records - requires products to exist)
        if not options['products_only'] and not options['components_only'] and not options['checkouts_only']:
            # If assets-only flag is used, ensure products exist first
            if options['assets_only']:
                products_count = Product.objects.filter(is_deleted=False).count()
                if products_count == 0:
                    self.stdout.write(self.style.WARNING('\n⚠ No products found. Seeding products first...'))
                    self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Products (100 records) ==='))
                    call_command('seed_products')
                else:
                    self.stdout.write(self.style.SUCCESS(f'\n✓ Found {products_count} existing products'))

            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Assets (100 records) ==='))
            call_command('seed_assets', clear_flag) if clear_flag else call_command('seed_assets')

        # Seed Asset Checkouts (40 records - requires assets to exist)
        if not options['products_only'] and not options['components_only'] and not options['assets_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Asset Checkouts (40 records) ==='))
            call_command('seed_asset_checkouts', clear_flag) if clear_flag else call_command('seed_asset_checkouts')

        # Seed Components (100 records)
        if not options['products_only'] and not options['assets_only'] and not options['checkouts_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Components (100 records) ==='))
            call_command('seed_components', clear_flag) if clear_flag else call_command('seed_components')

        self.stdout.write(self.style.SUCCESS('\n✓ All assets service seeding complete!'))

