import os
import django
import time
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bidverse.settings')
django.setup()

from auctions.models import Auction, Category
from bids.models import Bid
from notifications.models import Notification
from django.contrib.auth import get_user_model
from auctions.utils import close_expired_auctions

User = get_user_model()

def test_auction_closing():
    print("Starting test_auction_closing...")
    
    # 1. Setup
    seller = User.objects.filter(role='seller').first()
    bidder = User.objects.filter(role='bidder').first()
    category = Category.objects.first()
    
    if not seller or not bidder:
        print("Error: Need at least one seller and one bidder in DB.")
        return

    # 2. Create auction that ends in 3 seconds
    auction = Auction.objects.create(
        seller=seller,
        title="Test Expiring Auction",
        description="Will close soon",
        starting_bid=100.00,
        current_bid=100.00,
        status='active',
        start_time=timezone.now() - timedelta(minutes=1),
        end_time=timezone.now() + timedelta(seconds=3),
        category=category
    )
    print(f"Created auction {auction.id}, ends in 3 seconds.")

    # 3. Place a winning bid
    Bid.objects.create(
        auction=auction,
        bidder=bidder,
        amount=110.00,
        is_winning=True
    )
    auction.current_bid = 110.00
    auction.save()
    print("Placed winning bid.")

    # 4. Wait for expiration
    print("Waiting 5 seconds for auction to expire...")
    time.sleep(5)

    # 5. Trigger settlement
    print("Running close_expired_auctions()...")
    count = close_expired_auctions()
    print(f"Settled {count} auctions.")

    # 6. Verify
    auction.refresh_from_db()
    if auction.status == 'closed':
        print("PASS: Auction status is 'closed'.")
    else:
        print(f"FAIL: Auction status is {auction.status}.")

    winner_notif = Notification.objects.filter(user=bidder, notification_type='auction_won').first()
    if winner_notif:
        print(f"PASS: Winner notified: {winner_notif.title}")
    else:
        print("FAIL: Winner NOT notified.")

    seller_notif = Notification.objects.filter(user=seller, notification_type='closed').first()
    if seller_notif:
        print(f"PASS: Seller notified: {seller_notif.title}")
    else:
        print("FAIL: Seller NOT notified.")

if __name__ == "__main__":
    test_auction_closing()
