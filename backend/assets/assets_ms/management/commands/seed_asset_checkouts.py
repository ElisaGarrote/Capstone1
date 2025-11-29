from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.utils import timezone
from assets_ms.models import Asset, AssetCheckout
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed the database with 40 AssetCheckout records for deployed assets (IDs 41-80)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing asset checkouts before seeding',
        )
        parser.add_argument(
            '--no-auto-seed-assets',
            action='store_true',
            help='Do not automatically seed assets if they don\'t exist',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing asset checkouts...'))
            AssetCheckout.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing asset checkouts cleared.'))

        # Check if assets exist
        deployed_assets = Asset.objects.filter(id__gte=41, id__lte=80, is_deleted=False)
        if not deployed_assets.exists():
            if options['no_auto_seed_assets']:
                self.stdout.write(self.style.ERROR(
                    'No deployed assets found (IDs 41-80). Please seed assets first using: python manage.py seed_assets'
                ))
                return
            else:
                self.stdout.write(self.style.WARNING('\n⚠ No deployed assets found. Auto-seeding assets first...'))
                self.stdout.write(self.style.MIGRATE_HEADING('\n=== Auto-Seeding Assets (100 records) ==='))
                call_command('seed_assets')
                # Refresh assets queryset
                deployed_assets = Asset.objects.filter(id__gte=41, id__lte=80, is_deleted=False)
                if not deployed_assets.exists():
                    self.stdout.write(self.style.ERROR('Failed to seed assets. Cannot create checkouts.'))
                    return
                self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully seeded assets'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding 40 Asset Checkouts ==='))

        checkouts_data = self.get_checkouts_data(deployed_assets)
        created_count = 0

        for checkout_data in checkouts_data:
            # Check if checkout already exists for this asset
            existing = AssetCheckout.objects.filter(
                asset=checkout_data['asset'],
                asset_checkin__isnull=True  # Only active checkouts
            ).exists()
            
            if existing:
                self.stdout.write(self.style.WARNING(
                    f'- Checkout exists for asset {checkout_data["asset"].asset_id}'
                ))
                continue

            checkout = AssetCheckout.objects.create(**checkout_data)
            created_count += 1
            if created_count % 10 == 0:
                self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} checkouts...'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Asset checkouts seeding complete: {created_count} created'))

    def get_checkouts_data(self, deployed_assets):
        base_date = timezone.now()

        # Employee IDs (simulating user IDs 1-20)
        employee_ids = list(range(1, 21))

        # Location IDs (1-10 from contexts seeder)
        location_ids = list(range(1, 11))

        checkouts = []

        # Create checkouts for deployed assets (IDs 41-80)
        for i, asset in enumerate(deployed_assets):
            # Ticket ID will match the checkin ticket (TKT041-TKT080)
            # But we need to create the checkout first, so use a placeholder
            # The checkout ticket ID is the same index position as checkout order
            ticket_id = i + 1  # Checkout ticket IDs 1-40

            employee_id = random.choice(employee_ids)
            location_id = random.choice(location_ids)

            # Checkout happened in the past (30-90 days ago)
            days_ago = random.randint(30, 90)
            checkout_date = (base_date - timedelta(days=days_ago)).date()
            # Return date is 7-30 days after checkout
            return_date = checkout_date + timedelta(days=random.randint(7, 30))

            # Condition at checkout (1-10, mostly good condition 7-10)
            condition = random.choices(
                population=list(range(1, 11)),
                weights=[1, 1, 1, 2, 2, 3, 3, 4, 4, 5],  # Higher weights for better conditions
                k=1
            )[0]

            # Status IDs 3 and 4 are deployed statuses (In Use, Checked Out)
            status_id = random.choice([3, 4])

            checkouts.append({
                'asset': asset,
                'ticket_id': ticket_id,
                'checkout_to': employee_id,
                'location': location_id,
                'checkout_date': checkout_date,
                'return_date': return_date,
                'status': status_id,
                'condition': condition,
                'notes': f'Checkout for asset {asset.asset_id} to employee {employee_id}',
            })

        return checkouts

