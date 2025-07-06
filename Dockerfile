# Multi-stage build pour optimiser la taille de l'image finale
FROM node:16.13.1-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json de la racine
COPY package*.json ./

# Copier les fichiers du frontend
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/

# Copier les fichiers du backend
COPY backend/package*.json ./backend/
COPY backend/ ./backend/

# Build du frontend
WORKDIR /app/frontend
RUN npm ci --only=production
RUN npm run build

# Installation des dépendances backend
WORKDIR /app/backend
RUN npm ci --only=production

# Stage de production
FROM node:16.13.1-alpine AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires depuis le stage builder
COPY --from=builder --chown=nodeuser:nodejs /app/backend ./backend
COPY --from=builder --chown=nodeuser:nodejs /app/frontend/build ./frontend/build
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/backend/node_modules ./backend/node_modules

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /app/backend/public/uploads && \
    mkdir -p /app/.adminjs && \
    mkdir -p /app/backend/.adminjs && \
    chown -R nodeuser:nodejs /app/backend/public/uploads && \
    chown -R nodeuser:nodejs /app/.adminjs && \
    chown -R nodeuser:nodejs /app/backend/.adminjs && \
    chown -R nodeuser:nodejs /app

# Basculer vers l'utilisateur non-root
USER nodeuser

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Commande de démarrage
CMD ["node", "backend/www/app.js"]