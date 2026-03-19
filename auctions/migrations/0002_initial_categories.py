from django.db import migrations

def create_initial_categories(apps, schema_editor):
    Category = apps.get_model('auctions', 'Category')
    initial_categories = [
        {'name': 'Electronics', 'description': 'Devices, gadgets, and accessories.'},
        {'name': 'Fashion', 'description': 'Clothing, shoes, and accessories.'},
        {'name': 'Sports', 'description': 'Sports equipment and memorabilia.'},
        {'name': 'Collectibles', 'description': 'Rare and collectible items.'},
        {'name': 'Art', 'description': 'Paintings, sculptures, and art pieces.'},
        {'name': 'Automotive', 'description': 'Cars, motorcycles, and parts.'},
        {'name': 'Home & Garden', 'description': 'Furniture, appliances, and garden tools.'},
        {'name': 'Toys', 'description': 'Toys, games, and hobbies.'},
    ]
    for cat in initial_categories:
        Category.objects.get_or_create(name=cat['name'], defaults={'description': cat['description']})

class Migration(migrations.Migration):
    dependencies = [
        ('auctions', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(create_initial_categories),
    ]