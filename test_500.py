import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bidverse.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from auctions.serializers import AuctionCreateSerializer

User = get_user_model()
seller = User.objects.filter(role='seller').first() or User.objects.create(username='test_seller', email='test@test.com', role='seller')

factory = RequestFactory()
request = factory.post('/api/auctions/')
request.user = seller

data = {
    'title': 'Test Auction',
    'description': 'Description',
    'starting_bid': '10.00',
    'start_time': '2026-03-15T12:00:00Z',
    'end_time': '2026-03-20T12:00:00Z',
    'location_address': '',
    'category': None
}

serializer = AuctionCreateSerializer(data=data, context={'request': request})
if serializer.is_valid():
    try:
        auction = serializer.save()
        print("Success! Auction created:", auction.id)
    except Exception as e:
        import traceback
        print("500 Error Caught!")
        traceback.print_exc()
else:
    print("Validation Error:", serializer.errors)
