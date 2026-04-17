FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu "torch==2.4.1+cpu"

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
