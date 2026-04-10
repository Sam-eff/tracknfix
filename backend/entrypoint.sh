#!/bin/sh

# If a command is passed (like in your docker-compose.yml), run that command only
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# If NO command is passed (Production mode), run everything
echo "Starting Production Services..."

# Run migrations and static files
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Start Gunicorn in the background
gunicorn config.wsgi:application --bind 0.0.0.0:7860 --workers 2 &

# Start Celery Worker in the background
celery -A config worker -l info &

# Start Celery Beat in the foreground (this keeps the container alive)
exec celery -A config beat -l info
