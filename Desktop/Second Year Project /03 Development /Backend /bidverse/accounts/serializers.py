from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'password_confirm', 'name')
        extra_kwargs = {
            'name': {'required': True}
        }
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        name = validated_data.pop('name', '')
        
        user = CustomUser.objects.create_user(
            email=email,
            password=password
        )
        # Set the name field after user creation
        if name:
            user.name = name
            user.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate user credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'name', 'date_joined', 'last_login')
        read_only_fields = ('id', 'email', 'date_joined', 'last_login')

