# Adopte un Étudiant - Backend API

API REST Node.js pour la plateforme de mise en relation entre étudiants et entreprises. Cette API gère l'authentification, les offres d'emploi, les candidatures et la gestion des utilisateurs.

## 🎯 **Fonctionnalités de l'API**

### Authentification et Utilisateurs
- 🔐 **Authentification JWT** : Connexion sécurisée avec tokens
- 👤 **Gestion des utilisateurs** : Étudiants et entreprises
- 🔒 **Autorisation basée sur les rôles** : Permissions différenciées
- 📧 **Validation des emails** : Vérification et confirmation

### Offres d'Emploi
- 📋 **CRUD complet** : Création, lecture, mise à jour, suppression
- 🔍 **Recherche avancée** : Filtrage par domaine, type, localisation
- 📊 **Statistiques** : Métriques pour les entreprises
- 🏷️ **Catégorisation** : Domaines et types d'emploi

### Candidatures
- 📝 **Gestion des candidatures** : Soumission et suivi
- 📈 **Statuts de candidature** : En attente, acceptée, refusée
- 📅 **Planification d'entretiens** : Gestion des rendez-vous
- 🚫 **Prévention des doublons** : Une candidature par offre

## 🛠 **Technologies Utilisées**

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe
- **Jest** - Framework de tests
- **Supertest** - Tests d'API
- **Mockingoose** - Mock pour Mongoose

## 🚀 **Installation et Configuration**

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **MongoDB** (version 4.4 ou supérieure)
- **npm** ou **yarn**

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd adopteunetudiant/backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### Variables d'Environnement
```bash
# .env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/adopteunetudiant
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📜 **Scripts Disponibles**

### Développement
```bash
# Démarrer le serveur de développement
npm start
# Serveur disponible sur http://localhost:3001

# Démarrer avec nodemon (rechargement automatique)
npm run dev

# Démarrer en mode production
npm run start:prod
```

### Tests
```bash
# Tests unitaires et d'intégration (Jest)
npm test                    # Tous les tests
npm run test:watch         # Mode watch
npm test -- --coverage    # Avec rapport de couverture

# Tests spécifiques
npm test -- jobOffers      # Tests des offres d'emploi
npm test -- jobApplications # Tests des candidatures
npm test -- auth           # Tests d'authentification
```

### Base de Données
```bash
# Seeder la base de données (développement)
npm run seed

# Nettoyer la base de données
npm run db:clean

# Migrations (si applicable)
npm run migrate
```

## 📁 **Structure du Projet**

```
backend/
├── controllers/           # Contrôleurs de l'API
│   ├── authController.js # Authentification
│   ├── userController.js # Gestion des utilisateurs
│   ├── jobController.js  # Offres d'emploi
│   └── applicationController.js # Candidatures
├── models/               # Modèles Mongoose
│   ├── User.js          # Modèle utilisateur
│   ├── JobOffer.js      # Modèle offre d'emploi
│   └── Application.js   # Modèle candidature
├── routes/              # Routes de l'API
│   ├── auth.js         # Routes d'authentification
│   ├── users.js        # Routes utilisateurs
│   ├── jobOffers.js    # Routes offres d'emploi
│   └── applications.js # Routes candidatures
├── middleware/          # Middlewares
│   ├── auth.js         # Middleware d'authentification
│   ├── validation.js   # Validation des données
│   └── errorHandler.js # Gestion des erreurs
├── utils/              # Utilitaires
│   ├── database.js     # Configuration MongoDB
│   ├── email.js        # Service d'email
│   └── helpers.js      # Fonctions utilitaires
├── tests/              # Tests (Jest)
│   ├── jobOffers.spec.js    # Tests offres d'emploi
│   ├── jobApplications.spec.js # Tests candidatures
│   └── auth.spec.js         # Tests authentification
├── config/             # Configuration
│   └── database.js     # Configuration DB
├── package.json        # Dépendances et scripts
└── server.js          # Point d'entrée de l'application
```

## 🌐 **Endpoints de l'API**

### Authentification (`/api/auth`)
```http
POST /api/login              # Connexion utilisateur
POST /api/register           # Inscription utilisateur
POST /api/logout             # Déconnexion
POST /api/refresh-token      # Renouvellement du token
POST /api/forgot-password    # Mot de passe oublié
POST /api/reset-password     # Réinitialisation du mot de passe
```

### Utilisateurs (`/api/users`)
```http
GET    /api/users           # Liste des utilisateurs (admin)
GET    /api/users/:id       # Profil utilisateur
PUT    /api/users/:id       # Mise à jour du profil
DELETE /api/users/:id       # Suppression du compte
GET    /api/users/me        # Profil de l'utilisateur connecté
PUT    /api/users/me        # Mise à jour du profil connecté
```

### Offres d'Emploi (`/api/jobOffers`)
```http
GET    /api/jobOffers       # Liste des offres (avec filtres)
GET    /api/jobOffers/:id   # Détail d'une offre
POST   /api/jobOffers       # Créer une offre (entreprise)
PUT    /api/jobOffers/:id   # Modifier une offre (entreprise)
DELETE /api/jobOffers/:id   # Supprimer une offre (entreprise)
GET    /api/jobOffers/company/:companyId # Offres d'une entreprise
```

#### Paramètres de Filtrage
```http
GET /api/jobOffers?domain=informatique&type=stage&location=paris&search=react
```

### Candidatures (`/api/applications`)
```http
GET    /api/applications           # Liste des candidatures
GET    /api/applications/:id       # Détail d'une candidature
POST   /api/applications           # Postuler à une offre (étudiant)
PUT    /api/applications/:id       # Modifier le statut (entreprise)
DELETE /api/applications/:id       # Supprimer une candidature
GET    /api/applications/job/:jobId # Candidatures pour une offre
GET    /api/applications/student/:studentId # Candidatures d'un étudiant
```

### Domaines et Types (`/api/metadata`)
```http
GET /api/domains        # Liste des domaines d'emploi
GET /api/searchTypes    # Liste des types d'emploi
GET /api/locations      # Liste des localisations
```

## 🗄️ **Schéma de Base de Données**

### Modèle User
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstname: String (required),
  lastname: String (required),
  isStudent: Boolean (required),

  // Champs spécifiques aux étudiants
  school: String,
  studyLevel: String,
  skills: [String],
  cv: String, // URL du CV

  // Champs spécifiques aux entreprises
  companyName: String,
  companyDescription: String,
  website: String,
  sector: String,

  // Métadonnées
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

### Modèle JobOffer
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  company: ObjectId (ref: 'User', required),
  domain: String (required),
  type: String (required), // stage, emploi, alternance
  location: String (required),
  salary: String,
  requirements: [String],
  benefits: [String],

  // Statut et dates
  status: String, // active, inactive, expired
  publishedAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date,

  // Statistiques
  viewCount: Number (default: 0),
  applicationCount: Number (default: 0)
}
```

### Modèle Application
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: 'User', required),
  jobOffer: ObjectId (ref: 'JobOffer', required),
  company: ObjectId (ref: 'User', required),

  // Contenu de la candidature
  coverLetter: String,
  cv: String, // URL du CV

  // Statut et suivi
  status: String, // pending, reviewed, accepted, rejected
  appliedAt: Date (default: Date.now),
  reviewedAt: Date,

  // Communication
  companyNotes: String,
  studentNotes: String,

  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 **Tests Complets**

### Suite de Tests Jest
- ✅ **Tests d'API complets** : Tous les endpoints testés
- ✅ **Mocking avancé** : Mockingoose pour MongoDB
- ✅ **Couverture élevée** : Tests unitaires et d'intégration
- ✅ **Données de test** : Factories et utilitaires réutilisables

### Tests par Catégorie

#### Tests des Offres d'Emploi (`jobOffers.spec.js`)
```bash
npm test -- jobOffers
```
- CRUD complet des offres d'emploi
- Filtrage et recherche
- Autorisation et permissions
- Validation des données
- Gestion des erreurs

#### Tests des Candidatures (`jobApplications.spec.js`)
```bash
npm test -- jobApplications
```
- Processus de candidature complet
- Gestion des statuts
- Prévention des doublons
- Statistiques et métriques
- Notifications

#### Tests d'Authentification (`auth.spec.js`)
```bash
npm test -- auth
```
- Inscription et connexion
- Validation JWT
- Gestion des rôles
- Sécurité des mots de passe
- Gestion de session

### Exécution des Tests
```bash
# Tous les tests
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm test -- --testNamePattern="should create job offer"
```

## 🔐 **Sécurité et Authentification**

### Authentification JWT
- **Tokens sécurisés** : Signature avec secret fort
- **Expiration automatique** : Durée de vie configurable
- **Refresh tokens** : Renouvellement automatique
- **Blacklisting** : Révocation des tokens

### Sécurité des Données
- **Hachage bcrypt** : Mots de passe sécurisés (salt rounds: 12)
- **Validation stricte** : Joi/Express-validator
- **Sanitisation** : Protection contre les injections
- **Rate limiting** : Protection contre les attaques par force brute

### Autorisation
```javascript
// Middleware d'authentification
const auth = require('./middleware/auth');

// Protection des routes
router.get('/protected', auth, controller.protectedRoute);

// Autorisation basée sur les rôles
router.post('/company-only', auth, requireRole('company'), controller.companyRoute);
```

### Variables d'Environnement Sécurisées
```bash
# Production
JWT_SECRET=super-long-random-string-min-32-chars
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
NODE_ENV=production
CORS_ORIGIN=https://adopteunetudiant.com
```

## 🛠 **Développement**

### Workflow de Développement
```bash
# 1. Démarrer MongoDB
mongod

# 2. Démarrer le serveur de développement
npm run dev

# 3. Tester les endpoints
npm test

# 4. Vérifier la qualité du code
npm run lint
```

### Debugging
```bash
# Mode debug avec Node.js
npm run debug

# Logs détaillés
DEBUG=app:* npm start

# Tests en mode debug
npm test -- --detectOpenHandles --forceExit
```

### Base de Données de Développement
```bash
# Seeder avec des données de test
npm run seed

# Nettoyer la base de données
npm run db:clean

# Backup de la base de données
mongodump --db adopteunetudiant --out ./backup
```

## 🚀 **Déploiement**

### Préparation pour la Production
```bash
# Variables d'environnement de production
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret

# Build et démarrage
npm install --production
npm start
```

### Docker (Optionnel)
```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Construire et démarrer avec Docker
docker build -t adopteunetudiant-backend .
docker run -p 3001:3001 adopteunetudiant-backend
```

### Serveurs Supportés
- **PM2** : Gestionnaire de processus (recommandé)
- **Heroku** : Déploiement cloud simple
- **AWS EC2** : Serveur dédié
- **DigitalOcean** : VPS économique
- **Docker** : Containerisation

### Configuration PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'adopteunetudiant-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## 📊 **Monitoring et Maintenance**

### Logs et Monitoring
```bash
# Logs de l'application
tail -f logs/app.log

# Monitoring avec PM2
pm2 monit

# Statistiques de performance
npm run stats
```

### Maintenance de la Base de Données
```bash
# Indexation pour les performances
db.jobOffers.createIndex({ "domain": 1, "type": 1 })
db.applications.createIndex({ "student": 1, "jobOffer": 1 })

# Nettoyage des données expirées
npm run cleanup:expired

# Backup automatique
npm run backup:daily
```

### Métriques Importantes
- **Temps de réponse API** : < 200ms pour les endpoints simples
- **Taux d'erreur** : < 1% des requêtes
- **Disponibilité** : > 99.9% uptime
- **Utilisation mémoire** : Monitoring des fuites mémoire

## 📚 **Documentation API**

### Swagger/OpenAPI
```bash
# Générer la documentation API
npm run docs:generate

# Servir la documentation
npm run docs:serve
# Disponible sur http://localhost:3001/api-docs
```

### Postman Collection
- Collection Postman disponible dans `/docs/postman/`
- Variables d'environnement configurées
- Tests automatisés inclus

## 🤝 **Contribution**

### Standards de Code
- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **Tests** : Couverture minimale de 90%
- **Documentation** : JSDoc pour les fonctions

### Workflow de Contribution
1. Fork le projet
2. Créer une branche feature
3. Développer avec tests
4. Vérifier la qualité (`npm run lint`)
5. Soumettre une Pull Request

---

## 📞 **Support**

### Dépannage Courant
```bash
# Problème de connexion MongoDB
npm run db:check

# Problème de permissions
npm run fix:permissions

# Réinitialiser la base de données
npm run db:reset
```

### Ressources
- [Documentation MongoDB](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [JWT.io](https://jwt.io/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

**L'API backend est maintenant prête pour le développement et la production !** 🎉
