FROM python:3.11-slim

WORKDIR /app

COPY requisitos.txt .

RUN pip install -r requisitos.txt

COPY . .

CMD ["python", "app.py"]