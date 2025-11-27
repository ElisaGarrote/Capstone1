from django.core.management.base import BaseCommand
from contexts_ms.models import Status


class Command(BaseCommand):
    help = 'Seed the database with 10 status records (2 per status type)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing statuses before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing statuses...'))
            Status.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing statuses cleared.'))

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seeding 10 Statuses ==='))

        statuses_data = self.get_statuses_data()
        created_count = 0

        for status_data in statuses_data:
            status, created = Status.objects.get_or_create(
                name=status_data['name'],
                type=status_data['type'],
                defaults=status_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {status.name} ({status.get_type_display()})'))
            else:
                self.stdout.write(self.style.WARNING(f'- Status exists: {status.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Statuses seeding complete: {created_count} created'))

    def get_statuses_data(self):
        """Generate 10 statuses: 2 for each status type"""
        
        statuses = [
            # Deployable statuses (2)
            {
                'name': 'Ready to Deploy',
                'type': Status.StatusType.DEPLOYABLE,
                'notes': 'Asset is ready to be assigned to an employee',
            },
            {
                'name': 'Available',
                'type': Status.StatusType.DEPLOYABLE,
                'notes': 'Asset is available in inventory',
            },
            
            # Deployed statuses (2)
            {
                'name': 'In Use',
                'type': Status.StatusType.DEPLOYED,
                'notes': 'Asset is currently assigned and in use',
            },
            {
                'name': 'Checked Out',
                'type': Status.StatusType.DEPLOYED,
                'notes': 'Asset has been checked out to an employee',
            },
            
            # Undeployable statuses (2)
            {
                'name': 'Under Repair',
                'type': Status.StatusType.UNDEPLOYABLE,
                'notes': 'Asset is being repaired and cannot be deployed',
            },
            {
                'name': 'Broken',
                'type': Status.StatusType.UNDEPLOYABLE,
                'notes': 'Asset is damaged and needs repair or replacement',
            },
            
            # Pending statuses (2)
            {
                'name': 'Pending Approval',
                'type': Status.StatusType.PENDING,
                'notes': 'Asset purchase or deployment is pending approval',
            },
            {
                'name': 'In Transit',
                'type': Status.StatusType.PENDING,
                'notes': 'Asset is being shipped or transferred',
            },
            
            # Archived statuses (2)
            {
                'name': 'Retired',
                'type': Status.StatusType.ARCHIVED,
                'notes': 'Asset has been retired from service',
            },
            {
                'name': 'Lost/Stolen',
                'type': Status.StatusType.ARCHIVED,
                'notes': 'Asset is lost or has been stolen',
            },
        ]
        
        return statuses

