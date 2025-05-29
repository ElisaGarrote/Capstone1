FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create static and media directories
RUN mkdir -p static
RUN mkdir -p staticfiles
RUN mkdir -p media

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8004

# Run gunicorn for production
CMD gunicorn accessories.wsgi:application --bind 0.0.0.0:8004