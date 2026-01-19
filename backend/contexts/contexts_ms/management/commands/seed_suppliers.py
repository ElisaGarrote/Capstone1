from django.core.management.base import BaseCommand
from django.db import connection
from contexts_ms.models import Supplier
import itertools


class Command(BaseCommand):
    help = 'Seed suppliers with realistic sample data.'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing suppliers before seeding')
        parser.add_argument('--count', type=int, default=50, help='Number of suppliers to ensure (max curated list)')

    def handle(self, *args, **options):
        clear = options.get('clear')
        count = int(options.get('count') or 50)
        if count < 1:
            self.stdout.write(self.style.ERROR('Count must be at least 1'))
            return

        curated = [
            ("Apex Supplies", "Maya Cruz"),
            ("Beacon Industrial Supply", "Carlos Reyes"),
            ("Cedar Office Solutions", "Lina Ortega"),
            ("Delta Components Co.", "Jonah Perez"),
            ("Everest Hardware", "Rosa Santos"),
            ("Falcon Tools & Parts", "Ethan Clarke"),
            ("Grove Electricals", "Amelia Tan"),
            ("Harbor Medical Supplies", "Diego Navarro"),
            ("Ivy Packaging Ltd.", "Sara Lim"),
            ("Juniper Tech Parts", "Noah Rivera"),
            ("Keystone Laboratory", "Isla Morales"),
            ("Lighthouse Logistics", "Miguel Gonzales"),
            ("Mariner Office Systems", "Nora Villanueva"),
            ("Northfield Industrial", "Lucas Silva"),
            ("Orchid Facilities", "Bianca Ramos"),
            ("Pioneer Parts Depot", "Owen Delgado"),
            ("Quarry Construction Supply", "Rhea Santos"),
            ("Ridgeview Electronics", "Hector Alvarez"),
            ("Summit Safety Gear", "Jade Fernandez"),
            ("Tidewater Components", "Felix Dela Cruz"),
            ("Urbana Office Interiors", "Mina Castro"),
            ("Valley Agricultural Supply", "Rafael Mendoza"),
            ("Westbridge Packaging", "Camila Ortega"),
            ("Xeno Clean Solutions", "Ian Navarro"),
            ("Youngstown Fabricators", "Leah Santos"),
            ("Zephyr Lab Instruments", "Mateo Ruiz"),
            ("Atlas Industrial Works", "Clara Gomez"),
            ("Brookfield Supplies", "Eli Navarro"),
            ("Cobalt Office Gear", "Paula Ramos"),
            ("Dynamo Energy Parts", "Herman Cruz"),
            ("Elm Street Distributors", "Tara Valdez"),
            ("Frontier HVAC Solutions", "Samir Khan"),
            ("Globe Packaging Co.", "Rina Bautista"),
            ("Harborview Instruments", "Diego Santos"),
            ("Indigo Industrial", "Nadia Herrera"),
            ("Junia Electricals", "Aaron Lim"),
            ("Kite Safety Supplies", "Maya Bautista"),
            ("Lumen Office Services", "Rico Fernandez"),
            ("Mason Concrete Supplies", "Sofia Reyes"),
            ("Nova Medical Devices", "Evan Cruz"),
            ("Orbis Tech Supplies", "Mira Delgado"),
            ("Peak Performance Parts", "Ruben Santos"),
            ("Quartz Industrial", "Lola Morales"),
            ("Raven Security Systems", "Dante Ruiz"),
            ("Sable Components", "Ivy Mendoza"),
            ("Timberline Tools", "Omar Villanueva"),
            ("Unity Facilities", "Gina Alvarez"),
            ("Vantage Office Solutions", "Ben Torres"),
            ("Willow Packaging", "Ana Perez"),
        ]

        curated = curated[:max(1, min(len(curated), count))]

        if clear:
            try:
                table_name = Supplier._meta.db_table
                with connection.cursor() as cursor:
                    cursor.execute(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE')
                self.stdout.write(self.style.SUCCESS('Cleared existing suppliers (IDs reset to 1).'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to clear suppliers: {e}'))

        created = 0
        country_codes = itertools.cycle(["63", "1", "44", "61", "49"])  # PH, US, UK, AU, DE

        for idx, (company, contact) in enumerate(curated, start=1):
            cc = next(country_codes)
            phone_number = f"+{cc}{900000000 + idx}"

            supplier_data = {
                'name': company,
                'address': f"{100 + idx} Commerce Way",
                'city': 'Metro City',
                'state_province': 'Central',
                'country': 'Philippines' if cc == '63' else ('United States' if cc == '1' else 'United Kingdom' if cc == '44' else 'Australia' if cc == '61' else 'Germany'),
                'zip': f"{1000 + idx}",
                'contact_name': contact,
                'phone_number': phone_number,
                'fax': '',
                'email': f"info+{idx}@{company.lower().replace(' ', '').replace('.', '')}.com",
                'url': f"https://www.{company.lower().replace(' ', '').replace('.', '')}.com",
            }

            try:
                Supplier.objects.create(**supplier_data)
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {company}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create {company}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Suppliers seeding complete: {created} created."))

