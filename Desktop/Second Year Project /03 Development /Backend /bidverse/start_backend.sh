#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
echo "Starting Django backend server..."
python manage.py runserver

