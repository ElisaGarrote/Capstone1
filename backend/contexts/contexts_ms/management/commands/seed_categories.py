from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError, connection
from contexts_ms.models import Category
from contexts_ms.utils import normalize_name_smart


class Command(BaseCommand):
    help = "Seed categories for development/testing."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=50, help="Number of categories to create (default: 50)")
        parser.add_argument(
            "--batch-size",
            type=int,
            default=50,
            help="Batch size used for bulk_create (default: 50)",
        )
        parser.add_argument(
            "--types",
            type=str,
            default="asset,component",
            help="Comma-separated category types to cycle through (asset,component)",
        )
        parser.add_argument("--dry-run", action="store_true", help="Validate only; don't write to DB")
        parser.add_argument("--prefix", type=str, default="Seeder Category", help="Prefix for generated names")
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing categories before seeding',
        )
        parser.add_argument(
            '--use-real',
            action='store_true',
            help='Use a curated list of realistic category names instead of generated prefixes',
        )

    def handle(self, *args, **options):
        count = options.get("count") or 50
        batch_size = options.get("batch_size") or 50
        types = [t.strip() for t in (options.get("types") or "asset,component").split(",") if t.strip()]
        dry_run = options.get("dry_run")
        prefix = options.get("prefix") or "Seeder Category"
        clear = options.get('clear')

        if clear:
            self.stdout.write(self.style.WARNING('Clearing existing categories...'))
            table_name = Category._meta.db_table
            with connection.cursor() as cursor:
                cursor.execute(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE')
            self.stdout.write(self.style.SUCCESS('Existing categories cleared (IDs reset to 1).'))

        if not types:
            self.stderr.write(self.style.ERROR("No types provided; aborting."))
            return

        self.stdout.write(f"Preparing to create {count} categories (batch_size={batch_size})")

        # Load existing non-deleted category names/types to avoid duplicates
        existing = set(
            (name.lower(), ctype) for name, ctype in Category.objects.filter(is_deleted=False).values_list("name", "type") if name
        )

        to_create = []
        skipped = []
        planned_names = set()
        use_real = options.get('use_real')

        # curated lists for more realistic names
        asset_names = [
            'Laptops', 'Desktops', 'Monitors', 'Network Equipment', 'Printers', 'Projectors',
            'Servers', 'Storage', 'Cameras', 'Telephones', 'Scanners', 'UPS', 'Routers', 'Switches',
            'Keyboards', 'Mice', 'Tablets', 'Smartphones', 'Workstations', 'Thin Clients', 'Docking Stations',
            'Cables', 'Adapters', 'Chassis', 'Power Units'
        ]
        component_names = [
            'Hard Drives', 'SSDs', 'Memory (RAM)', 'Processors (CPU)', 'Graphics Cards', 'Power Supplies',
            'Fans', 'Heatsinks', 'Motherboards', 'Network Cards', 'Batteries', 'Display Panels', 'Controllers',
            'Sensors', 'Connectors', 'Brackets', 'Cables', 'Buttons', 'LEDs', 'Capacitors', 'Resistors',
            'Adapters', 'Enclosures', 'Firmware Chips', 'Cooling Modules'
        ]

        asset_idx = 0
        component_idx = 0

        # When using --use-real, create all asset categories first, then component categories
        # This ensures predictable IDs: assets get IDs 1-25, components get IDs 26-50
        if use_real:
            # First pass: create asset categories
            for i in range(min(count, len(asset_names))):
                if 'asset' not in types:
                    break
                base = asset_names[i]
                name = normalize_name_smart(base)
                if (name.lower(), 'asset') in existing or (name.lower(), 'asset') in planned_names:
                    name = normalize_name_smart(f"{base} {i+1}")
                if (name.lower(), 'asset') in existing:
                    skipped.append((name, 'asset'))
                    continue
                planned_names.add((name.lower(), 'asset'))
                obj = Category(name=name, type='asset')
                to_create.append(obj)

            # Second pass: create component categories
            for i in range(min(count, len(component_names))):
                if 'component' not in types:
                    break
                if len(to_create) + len(skipped) >= count:
                    break
                base = component_names[i]
                name = normalize_name_smart(base)
                if (name.lower(), 'component') in existing or (name.lower(), 'component') in planned_names:
                    name = normalize_name_smart(f"{base} {i+1}")
                if (name.lower(), 'component') in existing:
                    skipped.append((name, 'component'))
                    continue
                planned_names.add((name.lower(), 'component'))
                obj = Category(name=name, type='component')
                to_create.append(obj)
        else:
            # Original alternating behavior for non-real mode
            for i in range(count):
                ctype = types[i % len(types)]
                raw_name = f"{prefix} {i+1:03d}"
                name = normalize_name_smart(raw_name)

                if (name.lower(), ctype) in existing:
                    skipped.append((name, ctype))
                    continue

                planned_names.add((name.lower(), ctype))
                obj = Category(name=name, type=ctype)
                to_create.append(obj)

        self.stdout.write(f"Planned: {len(to_create)} new, skipped {len(skipped)} existing")

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run -- no changes applied."))
            for name, ctype in skipped[:10]:
                self.stdout.write(f"  skipped: {name} ({ctype})")
            return

        created = 0
        try:
            for start in range(0, len(to_create), batch_size):
                batch = to_create[start : start + batch_size]
                with transaction.atomic():
                    Category.objects.bulk_create(batch, batch_size=batch_size)
                created += len(batch)
                self.stdout.write(self.style.SUCCESS(f"Inserted batch {start}-{start+len(batch)-1}: {len(batch)} records"))
        except IntegrityError as exc:
            self.stderr.write(self.style.ERROR(f"IntegrityError while inserting: {exc}"))

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created} categories. Skipped {len(skipped)} existing."))
