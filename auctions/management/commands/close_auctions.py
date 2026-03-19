from django.core.management.base import BaseCommand
from auctions.utils import close_expired_auctions

class Command(BaseCommand):
    help = 'Closes all expired auctions and notifies winners'

    def handle(self, *args, **options):
        count = close_expired_auctions()
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully closed {count} auctions'))
        else:
            self.stdout.write('No expired auctions to close')
