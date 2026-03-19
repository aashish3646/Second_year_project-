from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self) -> None:
        # Ensure the default admin user exists for local development.
        # This is intentionally opinionated per project requirement.
        from django.db.models.signals import post_migrate

        def _ensure_default_admin(**kwargs):
            from django.contrib.auth import get_user_model

            User = get_user_model()
            username = "admin"
            password = "admin@1234"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": "admin@example.com",
                    "role": "admin",
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                },
            )

            # Always keep the admin account privileged + password synced.
            changed = False
            if not user.is_staff:
                user.is_staff = True
                changed = True
            if not user.is_superuser:
                user.is_superuser = True
                changed = True
            if getattr(user, "role", None) != "admin":
                user.role = "admin"
                changed = True

            user.set_password(password)
            changed = True

            if changed:
                user.save()

        post_migrate.connect(_ensure_default_admin, sender=self, dispatch_uid="accounts.ensure_default_admin")
        return super().ready()
