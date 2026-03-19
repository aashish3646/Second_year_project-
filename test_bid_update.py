
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bidverse.settings')
django.setup()

from bids.models import Bid
from bids.serializers import BidSerializer
from auctions.models import Auction
from django.contrib.auth import get_user_model
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

User = get_user_model()
user = User.objects.all().first()
auction = Auction.objects.filter(status='active').first()

if not auction:
    print("No active auction for testing.")
    exit()

bid = Bid.objects.filter(auction=auction).first()
if not bid:
    bid = Bid.objects.create(auction=auction, bidder=user, amount=auction.starting_bid + 1, is_winning=True)

factory = APIRequestFactory()
request = factory.patch(f'/api/bids/{bid.id}/', {'amount': bid.amount + 10})
request.user = user

serializer = BidSerializer(instance=bid, data={'amount': bid.amount + 10}, context={'request': request}, partial=True)
if serializer.is_valid():
    try:
        serializer.save()
        print("Update successful!")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("Serializer invalid:", serializer.errors)
