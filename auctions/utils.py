from django.utils import timezone
from .models import Auction
from bids.models import Bid
from notifications.views import create_notification, notify_admins

def close_expired_auctions():
    """
    Finds all active auctions that have passed their end_time,
    updates their status to 'closed', and notifies the winners and sellers.
    """
    now = timezone.now()
    expired_auctions = Auction.objects.filter(
        status='active',
        end_time__lte=now
    )

    count = 0
    for auction in expired_auctions:
        auction.status = 'closed'
        auction.save(update_fields=['status', 'updated_at'])
        count += 1

        # Find the winning bid
        winning_bid = Bid.objects.filter(auction=auction, is_winning=True).first()

        if winning_bid:
            # Notify the winner
            create_notification(
                user=winning_bid.bidder,
                notification_type='auction_won',
                title=f"Congratulations! You won: {auction.title}",
                message=f"You won the auction '{auction.title}' with a bid of ${winning_bid.amount}.",
                link=f"/auctions/{auction.id}"
            )
            
            # Notify the seller that it sold
            create_notification(
                user=auction.seller,
                notification_type='closed',
                title=f"Auction Sold: {auction.title}",
                message=f"Your auction '{auction.title}' has ended. The winner is {winning_bid.bidder.username} with ${winning_bid.amount}.",
                link=f"/auctions/{auction.id}"
            )

            # Notify admins of the win
            notify_admins(
                notification_type='admin_alert',
                title=f"Auction Won: {auction.title}",
                message=f"Auction '{auction.title}' completed. Winner: {winning_bid.bidder.username} (${winning_bid.amount}).",
                link=f"/auctions/{auction.id}"
            )
        else:
            # Notify the seller that it ended without bids
            create_notification(
                user=auction.seller,
                notification_type='closed',
                title=f"Auction Ended: {auction.title}",
                message=f"Your auction '{auction.title}' has ended with no bids.",
                link=f"/auctions/{auction.id}"
            )

    return count
