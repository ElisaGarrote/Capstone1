from django.core.management.base import BaseCommand
from django.utils import timezone
from contexts_ms.models import Ticket
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed the database with 100 ticket records (checkout and checkin requests)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing tickets before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing tickets...'))
            Ticket.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing tickets cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding Tickets ==='))

        tickets_data = self.get_tickets_data()
        created_count = 0

        for i, ticket_data in enumerate(tickets_data, 1):
            ticket, created = Ticket.objects.get_or_create(
                ticket_number=ticket_data['ticket_number'],
                defaults=ticket_data
            )
            if created:
                created_count += 1
                if i % 10 == 0:
                    self.stdout.write(self.style.SUCCESS(f'✓ Created {i} tickets...'))
            else:
                self.stdout.write(self.style.WARNING(f'- Ticket exists: {ticket.ticket_number}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Tickets seeding complete: {created_count} created'))

    def get_tickets_data(self):
        base_date = timezone.now()

        # Employee names for variety
        employees = [
            'John Smith', 'Maria Garcia', 'Robert Johnson', 'Emily Davis', 'Michael Brown',
            'Sarah Wilson', 'David Martinez', 'Lisa Anderson', 'James Taylor', 'Jennifer Thomas',
            'William Moore', 'Patricia Jackson', 'Richard White', 'Linda Harris', 'Joseph Martin',
            'Elizabeth Thompson', 'Charles Garcia', 'Susan Robinson', 'Christopher Clark', 'Jessica Rodriguez',
        ]

        # Locations (IDs 1-10 from contexts seeder)
        location_ids = list(range(1, 11))

        # Subjects for checkout requests
        checkout_subjects = [
            'Laptop needed for remote work',
            'Desktop computer for new employee',
            'Monitor for dual screen setup',
            'Network equipment for branch office',
            'Printer for department use',
            'Laptop for business trip',
            'Replacement device - hardware failure',
            'Additional monitor for productivity',
            'Desktop for temporary contractor',
            'Equipment for project work',
            'Laptop for field work',
            'Monitor for conference room',
            'Network switch for expansion',
            'Printer for satellite office',
            'Workstation for design team',
        ]

        # Subjects for checkin requests
        checkin_subjects = [
            'Returning laptop after project completion',
            'Equipment return - employee resignation',
            'Monitor return - no longer needed',
            'Desktop return - office relocation',
            'Printer return - department consolidation',
            'Laptop return - end of remote work',
            'Equipment return - project ended',
            'Monitor return - workspace change',
            'Network equipment return',
            'Printer return - upgrade to new model',
        ]

        tickets = []

        # Create a list of asset IDs 1-100 and shuffle to ensure each is used once
        asset_ids = list(range(1, 101))
        random.shuffle(asset_ids)

        # Generate 100 tickets - each asset requested only once
        # First 50 tickets: checkout only (no checkin)
        # Last 50 tickets: checkout with checkin
        for i in range(1, 101):
            ticket_number = f'TKT{i:03d}'  # TKT001, TKT002, etc.

            # Get unique asset ID for this ticket
            asset_id = asset_ids[i - 1]

            # First 50 = checkout only, Last 50 = checkout with checkin
            has_checkin = i > 50

            employee = random.choice(employees)
            location_id = random.choice(location_ids)

            # Random date within last 90 days
            days_ago = random.randint(1, 90)
            created_date = base_date - timedelta(days=days_ago)

            # 30% resolved, 70% unresolved (so more buttons are visible)
            is_resolved = random.random() < 0.3

            if not has_checkin:
                # Checkout ticket only - checkin_date is NULL
                subject = random.choice(checkout_subjects)
                checkout_date = (created_date + timedelta(days=random.randint(1, 3))).date()
                return_date = checkout_date + timedelta(days=random.randint(7, 90))

                ticket_data = {
                    'ticket_number': ticket_number,
                    'ticket_type': Ticket.TicketType.CHECKOUT,
                    'employee': employee,
                    'asset': asset_id,
                    'subject': subject,
                    'location': location_id,
                    'checkout_date': checkout_date,
                    'return_date': return_date,
                    'checkin_date': None,  # NULL for checkout-only tickets
                    'asset_checkout': None,  # NULL for checkout-only tickets
                    'is_resolved': is_resolved,
                }
            else:
                # Checkin ticket - checkin_date has value
                subject = random.choice(checkin_subjects)
                checkin_date = (created_date + timedelta(days=random.randint(1, 3))).date()
                # Reference to a checkout record (IDs 1-50 correspond to first 50 tickets)
                asset_checkout_id = i - 50  # Maps tickets 51-100 to checkouts 1-50

                ticket_data = {
                    'ticket_number': ticket_number,
                    'ticket_type': Ticket.TicketType.CHECKIN,
                    'employee': employee,
                    'asset': asset_id,
                    'subject': subject,
                    'location': location_id,
                    'checkout_date': None,  # NULL for checkin tickets
                    'return_date': None,  # NULL for checkin tickets
                    'checkin_date': checkin_date,  # Has value for checkin tickets
                    'asset_checkout': asset_checkout_id,
                    'is_resolved': is_resolved,
                }

            tickets.append(ticket_data)

        return tickets

