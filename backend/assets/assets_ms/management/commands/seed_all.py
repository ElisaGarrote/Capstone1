from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Seed the database with all sample data (products, assets, components, tickets)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
        parser.add_argument(
            '--products-only',
            action='store_true',
            help='Seed only products',
        )
        parser.add_argument(
            '--assets-only',
            action='store_true',
            help='Seed only assets',
        )
        parser.add_argument(
            '--components-only',
            action='store_true',
            help='Seed only components',
        )
        parser.add_argument(
            '--tickets-only',
            action='store_true',
            help='Seed only tickets',
        )

    def handle(self, *args, **options):
        clear_flag = '--clear' if options['clear'] else ''

        # Seed Products (10 records)
        if not options['components_only'] and not options['assets_only'] and not options['tickets_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Products ==='))
            call_command('seed_products', clear_flag) if clear_flag else call_command('seed_products')

        # Seed Assets (10 records - requires products to exist)
        if not options['products_only'] and not options['components_only'] and not options['tickets_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Assets ==='))
            call_command('seed_assets', clear_flag) if clear_flag else call_command('seed_assets')

        # Seed Components (100 records)
        if not options['products_only'] and not options['assets_only'] and not options['tickets_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Components ==='))
            call_command('seed_components', clear_flag) if clear_flag else call_command('seed_components')

        # Seed Tickets (100 records - in contexts service)
        if not options['products_only'] and not options['assets_only'] and not options['components_only']:
            self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Tickets ==='))
            # Note: This command is in the contexts service
            try:
                call_command('seed_tickets', clear_flag) if clear_flag else call_command('seed_tickets')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not seed tickets: {e}'))
                self.stdout.write(self.style.WARNING('Run tickets seeder separately in contexts service'))

        self.stdout.write(self.style.SUCCESS('\n✓ All seeding complete!'))

