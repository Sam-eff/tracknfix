from django.db import connections
from django.db.utils import OperationalError
from django.http import JsonResponse
from django.utils import timezone


def healthcheck(request):
    database_status = "ok"
    status_code = 200

    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except OperationalError:
        database_status = "error"
        status_code = 503

    return JsonResponse(
        {
            "status": "ok" if status_code == 200 else "error",
            "database": database_status,
            "timestamp": timezone.now().isoformat(),
        },
        status=status_code,
    )
