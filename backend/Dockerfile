FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Added 'procps' so the script can manage background processes
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc procps \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Copy and prepare the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

# Changed from CMD to ENTRYPOINT
ENTRYPOINT ["/entrypoint.sh"]

