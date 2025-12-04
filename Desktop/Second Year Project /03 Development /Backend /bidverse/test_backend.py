#!/usr/bin/env python
"""Test script to verify backend setup"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bidverse.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import CustomUser
from accounts import views, serializers
from django.urls import reverse, resolve
from django.test import RequestFactory

User = get_user_model()

print("=" * 50)
print("BACKEND SETUP TEST")
print("=" * 50)

# Test 1: User Model
print("\n1. Testing User Model...")
try:
    assert User == CustomUser, "User model mismatch"
    assert User.USERNAME_FIELD == 'email', "USERNAME_FIELD should be 'email'"
    print("   ✓ User model configured correctly")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 2: Imports
print("\n2. Testing Imports...")
try:
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.contrib.auth import authenticate
    print("   ✓ All imports successful")
except Exception as e:
    print(f"   ✗ Import error: {e}")

# Test 3: URL Configuration
print("\n3. Testing URL Configuration...")
try:
    register_url = reverse('accounts:register')
    login_url = reverse('accounts:login')
    user_url = reverse('accounts:user')
    logout_url = reverse('accounts:logout')
    print(f"   ✓ Register URL: {register_url}")
    print(f"   ✓ Login URL: {login_url}")
    print(f"   ✓ User URL: {user_url}")
    print(f"   ✓ Logout URL: {logout_url}")
except Exception as e:
    print(f"   ✗ URL error: {e}")

# Test 4: Serializers
print("\n4. Testing Serializers...")
try:
    # Test registration serializer
    reg_data = {
        'email': 'test@example.com',
        'password': 'test123',
        'password_confirm': 'test123',
        'name': 'Test User'
    }
    reg_serializer = serializers.UserRegistrationSerializer(data=reg_data)
    print(f"   ✓ Registration serializer created: {reg_serializer.is_valid()}")
    
    # Test login serializer
    login_serializer = serializers.UserLoginSerializer()
    print(f"   ✓ Login serializer created")
    
    # Test user serializer
    user_serializer = serializers.UserSerializer()
    print(f"   ✓ User serializer created")
except Exception as e:
    print(f"   ✗ Serializer error: {e}")

# Test 5: Views
print("\n5. Testing Views...")
try:
    assert hasattr(views, 'register_view'), "register_view not found"
    assert hasattr(views, 'login_view'), "login_view not found"
    assert hasattr(views, 'user_view'), "user_view not found"
    assert hasattr(views, 'logout_view'), "logout_view not found"
    print("   ✓ All views exist")
except Exception as e:
    print(f"   ✗ View error: {e}")

print("\n" + "=" * 50)
print("All tests completed!")
print("=" * 50)

