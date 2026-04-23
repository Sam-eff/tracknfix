#!/bin/sh

PORT="${PORT:-7860}"
ENABLE_BACKGROUND_WORKERS="${ENABLE_BACKGROUND_WORKERS:-true}"

# If a command is passed (like in docker-compose), run that command only.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

echo "Starting Production Services..."

# Run migrations and static files
python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$ENABLE_BACKGROUND_WORKERS" = "true" ]; then
    echo "Background workers enabled; starting Gunicorn, Celery worker, and Celery beat..."
    gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 2 &
    celery -A config worker -l info &
    exec celery -A config beat -l info
fi

echo "Background workers disabled; starting Gunicorn only..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 2 --timeout 120
