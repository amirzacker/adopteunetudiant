# Déploiement de Adopte1Etudiant sur Coolify

Ce guide vous explique comment déployer votre application Node.js/React sur Coolify en utilisant Docker.

## Prérequis

- Un serveur Coolify configuré
- Accès à votre repository Git
- Base de données MongoDB (Atlas ou autre)

## Structure des fichiers

Votre projet doit contenir ces fichiers à la racine :

```
/
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
├── package.json (racine)
├── backend/
│   ├── package.json
│   └── ... (code backend)
└── frontend/
    ├── package.json
    └── ... (code frontend)
```

## Configuration Coolify

### 1. Créer un nouveau projet

1. Connectez-vous à votre interface Coolify
2. Créez un nouveau projet
3. Choisissez "Repository Git" comme source
4. Connectez votre repository GitHub/GitLab

### 2. Configuration du service

**Type de service :** Application Docker

**Build Configuration :**
- Build Command: `docker build -t adopte1etudiant .`
- Build Context: `/` (racine du projet)

**Runtime Configuration :**
- Port: `3001`
- Health Check Path: `/api/users`

### 3. Variables d'environnement

Configurez ces variables dans Coolify :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement Node.js | `production` |
| `PORT` | Port de l'application | `3001` |
| `MONGO_URI` | URI de connexion MongoDB | `mongodb+srv://...` |
| `SECRET_JWT_TOKEN` | Secret pour JWT | `your-super-secret-jwt-key` |
| `ADMIN_COOKIE_PASSWORD` | Mot de passe cookie admin | `your-admin-cookie-secret` |
| `SESSION_SECRET` | Secret de session | `your-session-secret` |
| `ADMIN_EMAIL` | Email administrateur | `admin@yourapp.com` |
| `ADMIN_PASSWORD` | Mot de passe admin | `secure-password` |
| `FRONT_URL` | URL du frontend | `https://yourdomain.com` |

### 4. Volumes persistants

Configurez un volume pour les uploads :
- Path dans le container: `/app/backend/public/uploads`
- Nom du volume: `adopte1etudiant-uploads`

### 5. Configuration du domaine

1. Ajoutez votre domaine dans la section "Domains"
2. Activez HTTPS avec Let's Encrypt
3. Configurez la redirection HTTP vers HTTPS

## Commandes de déploiement local (test)

Pour tester localement avant le déploiement :

```bash
# Build de l'image
docker build -t adopte1etudiant .

# Test avec docker-compose
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## Variables d'environnement sensibles

⚠️ **Important :** Ne jamais commiter les vraies valeurs dans le code !

### Pour la production sur Coolify :

1. **JWT Secret** : Générez une clé forte
   ```bash
   openssl rand -base64 32
   ```

2. **MongoDB URI** : Utilisez MongoDB Atlas ou votre propre instance
   - Créez un utilisateur dédié avec les permissions minimales
   - Activez l'authentification
   - Whitelistez l'IP de votre serveur Coolify

3. **Admin Credentials** : Changez les valeurs par défaut
   - Email admin différent de celui en dur dans le code
   - Mot de passe fort pour l'admin

## Structure Docker

### Multi-stage build
- **Stage 1 (builder)** : Build du frontend React et installation des dépendances
- **Stage 2 (production)** : Image légère avec seulement les fichiers nécessaires

### Optimisations incluses
- Image Alpine Linux (plus petite)
- Utilisateur non-root pour la sécurité
- Cache des layers Docker optimisé
- .dockerignore pour exclure les fichiers inutiles

## Surveillance et monitoring

### Health Check
Le Dockerfile inclut un health check qui vérifie :
- Disponibilité de l'API sur `/api/users`
- Réponse dans les 10 secondes
- Retry automatique en cas d'échec

### Logs
```bash
# Via Coolify interface
# Ou via Docker si accès direct
docker logs -f container-name
```

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   - Vérifiez la configuration du port dans Coolify
   - Assurez-vous qu'aucun autre service n'utilise le port 3001

2. **Problème de connexion MongoDB**
   - Vérifiez l'URI MongoDB
   - Contrôlez les permissions réseau (whitelist IP)
   - Testez la connexion depuis le serveur

3. **Uploads ne fonctionnent pas**
   - Vérifiez que le volume est bien monté
   - Contrôlez les permissions du répertoire

4. **Build échoue**
   - Vérifiez les logs de build dans Coolify
   - Testez le build localement avec Docker

### Commandes de debug

```bash
# Connexion au container
docker exec -it container-name sh

# Vérifier les fichiers
ls -la /app/backend/public/uploads

# Tester la connectivité MongoDB
# (depuis le container)
node -e "console.log('MongoDB URI:', process.env.MONGO_URI)"
```

## Migration depuis Render

Si vous migrez depuis Render :

1. **Variables d'environnement** : Exportez toutes les variables depuis Render
2. **Base de données** : Aucun changement nécessaire si vous utilisez MongoDB Atlas
3. **Domaine** : Mettez à jour le DNS pour pointer vers Coolify
4. **Uploads** : Migrez les fichiers uploadés si nécessaire

## Performance

### Recommandations pour Coolify

- **CPU** : 1-2 vCPU minimum
- **RAM** : 512MB-1GB minimum
- **Stockage** : SSD recommandé pour les uploads

### Optimisations possibles

1. **CDN** : Utilisez un CDN pour les assets statiques
2. **Compression** : Activez gzip dans Nginx (géré par Coolify)
3. **Caching** : Implémentez Redis pour les sessions si nécessaire