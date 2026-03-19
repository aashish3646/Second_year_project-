from __future__ import annotations

from datetime import timedelta
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from auctions.models import Auction, Category


class Command(BaseCommand):
    help = "Seed demo users and 10 realistic auctions."

    def add_arguments(self, parser):
        parser.add_argument("--admin-username", default="admin", help="Admin username")
        parser.add_argument("--admin-email", default="admin@bidverse.local", help="Admin email")
        parser.add_argument("--admin-password", default="admin12345", help="Admin password")

        parser.add_argument("--seller-username", default="verified_seller", help="Verified seller username")
        parser.add_argument("--seller-email", default="seller@bidverse.local", help="Verified seller email")
        parser.add_argument("--seller-password", default="seller12345", help="Verified seller password")

        parser.add_argument("--reset-auctions", action="store_true", help="Delete existing auctions before seeding")
        parser.add_argument(
            "--reset-passwords",
            action="store_true",
            help="Reset admin/seller passwords to the provided values (safe for local dev).",
        )

    def handle(self, *args, **options):
        User = get_user_model()

        admin, created = User.objects.get_or_create(
            username=options["admin_username"],
            defaults={
                "email": options["admin_email"],
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password(options["admin_password"])
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user."))
        else:
            # ensure flags are correct
            changed = False
            if admin.role != "admin":
                admin.role = "admin"
                changed = True
            if not admin.is_staff:
                admin.is_staff = True
                changed = True
            if not admin.is_superuser:
                admin.is_superuser = True
                changed = True
            if changed:
                admin.save(update_fields=["role", "is_staff", "is_superuser"])
            if options["reset_passwords"]:
                admin.set_password(options["admin_password"])
                admin.save(update_fields=["password"])
            self.stdout.write(self.style.WARNING("Admin user already exists (ensured flags)."))

        seller, seller_created = User.objects.get_or_create(
            username=options["seller_username"],
            defaults={
                "email": options["seller_email"],
                "role": "seller",
                "is_verified_seller": True,
                "phone_number": "+9779800000000",
                "address": "Kathmandu, Nepal",
            },
        )
        if seller_created:
            seller.set_password(options["seller_password"])
            seller.save()
            self.stdout.write(self.style.SUCCESS("Created verified seller user."))
        else:
            if not seller.is_verified_seller or seller.role != "seller":
                seller.is_verified_seller = True
                seller.role = "seller"
                seller.save(update_fields=["is_verified_seller", "role"])
            if options["reset_passwords"]:
                seller.set_password(options["seller_password"])
                seller.save(update_fields=["password"])
            self.stdout.write(self.style.WARNING("Seller user already exists (ensured verified)."))

        if options["reset_auctions"]:
            Auction.objects.all().delete()
            self.stdout.write(self.style.WARNING("Deleted existing auctions."))

        # Ensure marketplace categories exist.
        cats = {c.slug: c for c in Category.objects.all()}
        required_slugs = [
            "general-goods",
            "vehicles",
            "property-real-estate",
            "business-inventory",
            "luxury-high-value-items",
        ]
        missing = [s for s in required_slugs if s not in cats]
        if missing:
            self.stdout.write(self.style.WARNING(f"Missing categories: {missing}. Run migrations first."))
            cats = {c.slug: c for c in Category.objects.all()}

        now = timezone.now()

        samples = [
            {
                "title": "Apple iPhone 13 Pro (256GB) – Excellent Condition",
                "description": "Unlocked iPhone 13 Pro, 256GB, graphite. Battery health 88%. Includes box and cable.",
                "category": "general-goods",
                "starting_bid": 45000,
            },
            {
                "title": "Dell XPS 13 (2021) – i7/16GB/512GB SSD",
                "description": "Well-maintained ultrabook for work/study. Minor cosmetic wear, fully functional.",
                "category": "general-goods",
                "starting_bid": 75000,
            },
            {
                "title": "Seiko 5 Automatic Watch – Stainless Steel",
                "description": "Classic Seiko 5 automatic. Recently serviced. Includes extra strap.",
                "category": "luxury-high-value-items",
                "starting_bid": 12000,
            },
            {
                "title": "Sony Alpha a6400 Mirrorless Camera + Kit Lens",
                "description": "Great for creators. Low shutter count. Includes kit lens and two batteries.",
                "category": "general-goods",
                "starting_bid": 68000,
            },
            {
                "title": "Bose QC35 II Noise-Cancelling Headphones",
                "description": "Comfortable ANC headphones. Fully working, includes carrying case.",
                "category": "general-goods",
                "starting_bid": 14000,
            },
            {
                "title": "Solid Wood Study Desk + Chair (Minimal Design)",
                "description": "Sturdy desk and chair set, ideal for home office. Pickup in Kathmandu.",
                "category": "general-goods",
                "starting_bid": 8000,
            },
            {
                "title": "Honda Dio Scooter (2019) – Low Mileage",
                "description": "Smooth ride, serviced regularly. Bluebook available. Buyer to verify documents.",
                "category": "vehicles",
                "starting_bid": 85000,
            },
            {
                "title": "Mountain Bike (27.5\") – Alloy Frame, Disc Brakes",
                "description": "Great starter MTB. Recently replaced brake pads. Ready to ride.",
                "category": "vehicles",
                "starting_bid": 22000,
            },
            {
                "title": "2.5 Aana Residential Land – Peaceful Area (Bhaktapur)",
                "description": "Good access road, nearby utilities. Serious buyers only. Manual verification required.",
                "category": "property-real-estate",
                "starting_bid": 3500000,
            },
            {
                "title": "Rare Vintage Coin Set – Nepal (Collector’s Item)",
                "description": "A small set of vintage Nepali coins. Sold as-is. Ideal for collectors.",
                "category": "luxury-high-value-items",
                "starting_bid": 5000,
            },
        ]

        created_count = 0
        for i, s in enumerate(samples, start=1):
            cat = cats.get(s["category"])
            if not cat:
                continue

            start_time = now - timedelta(hours=random.randint(1, 24))
            end_time = now + timedelta(days=random.randint(2, 7))
            status = "pending" if getattr(cat, "requires_manual_review", False) else "active"

            auction = Auction.objects.create(
                seller=seller,
                category=cat,
                title=s["title"],
                description=s["description"],
                starting_bid=s["starting_bid"],
                current_bid=s["starting_bid"],
                status=status,
                start_time=start_time,
                end_time=end_time,
                location_address="Kathmandu, Nepal",
            )
            created_count += 1

            # For demo realism, bump current_bid slightly on some active auctions.
            if auction.status == "active" and i % 2 == 0:
                auction.current_bid = auction.starting_bid + random.randint(500, 5000)
                auction.save(update_fields=["current_bid", "updated_at"])

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} auctions."))
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Admin login:"))
        self.stdout.write(f"  username: {options['admin_username']}")
        self.stdout.write(f"  password: {options['admin_password']}")
        self.stdout.write(self.style.SUCCESS("Verified seller login:"))
        self.stdout.write(f"  username: {options['seller_username']}")
        self.stdout.write(f"  password: {options['seller_password']}")

