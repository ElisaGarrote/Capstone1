import unittest


def _build_cant_delete_message_for_test(instance, usage):
    label = instance.__class__.__name__.lower()
    asset_ids = usage.get('asset_ids') or []
    comp_ids = usage.get('component_ids') or []
    repair_ids = usage.get('repair_ids') or []

    display = None
    for attr in ('name', 'city', 'title'):
        val = getattr(instance, attr, None)
        if val:
            display = str(val)
            break

    def label_with_display():
        if display:
            return f"{label} '{display}'"
        return label

    if asset_ids:
        total = len(asset_ids)
        if total <= 5:
            samples = ', '.join(map(str, asset_ids))
            return f"Cannot delete {label_with_display()}. Currently used by Asset(s): {samples}."
        else:
            return f"Cannot delete {label_with_display()}. Currently used by assets."

    parts = []
    if comp_ids:
        parts.append('component(s)')
    if repair_ids:
        parts.append('repair(s)')

    if parts:
        if len(parts) == 1:
            body = parts[0]
        elif len(parts) == 2:
            body = f"{parts[0]} and {parts[1]}"
        else:
            body = ', '.join(parts[:-1]) + f", and {parts[-1]}"
        return f"Cannot delete {label_with_display()}. Currently used by {body}."

    return f"Cannot delete {label_with_display()}. It is referenced by other records."


class Dummy:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


class LocalTests(unittest.TestCase):
    def test_no_references(self):
        inst = Dummy(name='CtxA')
        msg = _build_cant_delete_message_for_test(inst, {})
        self.assertIn('Cannot delete', msg)
        self.assertIn('ctxa', msg.lower())

    def test_asset_samples(self):
        inst = Dummy(name='SupplierOne')
        usage = {'asset_ids': ['AST-1', 'AST-2']}
        msg = _build_cant_delete_message_for_test(inst, usage)
        self.assertIn('Asset(s): AST-1, AST-2', msg)

    def test_many_assets_generic(self):
        inst = Dummy(name='CatBig')
        usage = {'asset_ids': [f'A{i}' for i in range(10)]}
        msg = _build_cant_delete_message_for_test(inst, usage)
        self.assertIn('Currently used by assets', msg)

    def test_components_and_repairs(self):
        inst = Dummy(title='T1')
        usage = {'component_ids': [1], 'repair_ids': [2]}
        msg = _build_cant_delete_message_for_test(inst, usage)
        self.assertIn('component(s) and repair(s)', msg)


if __name__ == '__main__':
    unittest.main()
