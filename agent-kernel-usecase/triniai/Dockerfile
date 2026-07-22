FROM python:3.11-slim

WORKDIR /app

# Install the core Agent Kernel framework alongside this use case. In the
# competition fork this is already on PYTHONPATH; the pip install line below
# is a safety net when building this folder in isolation.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/triniai
ENV PYTHONPATH=/app

EXPOSE 8080
CMD ["python", "-m", "triniai.agent"]
