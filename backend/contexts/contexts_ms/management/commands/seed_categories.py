from django.core.management.base import BaseCommand
from contexts_ms.models import Category


class Command(BaseCommand):
    help = 'Seed the database with 10 category records (5 asset categories, 5 component categories)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing categories before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing categories...'))
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing categories cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding 10 Categories ==='))

        categories_data = self.get_categories_data()
        created_count = 0

        for category_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                type=category_data['type'],
                defaults=category_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {category.name} ({category.get_type_display()})'))
            else:
                self.stdout.write(self.style.WARNING(f'- Category exists: {category.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Categories seeding complete: {created_count} created'))

    def get_categories_data(self):
        """Generate 10 categories: 5 asset categories and 5 component categories"""
        
        # Asset categories
        asset_categories = [
            {'name': 'Laptops', 'type': Category.CategoryType.ASSET},
            {'name': 'Desktops', 'type': Category.CategoryType.ASSET},
            {'name': 'Monitors', 'type': Category.CategoryType.ASSET},
            {'name': 'Network Equipment', 'type': Category.CategoryType.ASSET},
            {'name': 'Printers', 'type': Category.CategoryType.ASSET},
        ]
        
        # Component categories
        component_categories = [
            {'name': 'Hard Drives', 'type': Category.CategoryType.COMPONENT},
            {'name': 'Memory (RAM)', 'type': Category.CategoryType.COMPONENT},
            {'name': 'Processors (CPU)', 'type': Category.CategoryType.COMPONENT},
            {'name': 'Graphics Cards', 'type': Category.CategoryType.COMPONENT},
            {'name': 'Power Supplies', 'type': Category.CategoryType.COMPONENT},
        ]
        
        # Combine all categories
        all_categories = asset_categories + component_categories
        
        return all_categories

