# Base Python
FROM python:3.12-slim

# Configure l’environnement
ENV PYTHONUNBUFFERED=1

# Dossier de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update \
    && apt-get install -y build-essential libpq-dev \
    && apt-get clean

# Copier requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le backend
COPY . .

# Exposer le port Django
EXPOSE 8000

# Commande de lancement
CMD ["python", "main.py"]
