from django.db import migrations


def seed_marketplace_categories(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    categories = [
        {
            "name": "General Goods",
            "slug": "general-goods",
            "description": "Phones, laptops, furniture, gadgets, watches, and everyday items.",
            "requires_manual_review": False,
        },
        {
            "name": "Vehicles",
            "slug": "vehicles",
            "description": "Cars, motorcycles, and vehicle parts. Requires stricter review.",
            "requires_manual_review": True,
        },
        {
            "name": "Property / Real Estate",
            "slug": "property-real-estate",
            "description": "Land and property listings. Requires manual admin approval.",
            "requires_manual_review": True,
        },
        {
            "name": "Business Inventory",
            "slug": "business-inventory",
            "description": "Bulk inventory and business stock. Requires extra source verification.",
            "requires_manual_review": False,
        },
        {
            "name": "Luxury / High Value Items",
            "slug": "luxury-high-value-items",
            "description": "High value goods (jewelry, luxury watches, collectibles). Requires stricter review.",
            "requires_manual_review": True,
        },
    ]

    for c in categories:
        Category.objects.update_or_create(
            slug=c["slug"],
            defaults={
                "name": c["name"],
                "description": c["description"],
                "requires_manual_review": c["requires_manual_review"],
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("auctions", "0002_initial_categories"),
    ]

    operations = [
        migrations.RunPython(seed_marketplace_categories, migrations.RunPython.noop),
    ]

