# Adopte un Étudiant - Frontend

Application React pour la plateforme de mise en relation entre étudiants et entreprises. Cette application permet aux étudiants de rechercher des offres d'emploi et de postuler, tandis que les entreprises peuvent publier des offres et gérer les candidatures.

## 🎯 **Fonctionnalités Principales**

### Pour les Étudiants
- 🔍 **Recherche d'emplois** : Recherche et filtrage des offres par domaine, type, localisation
- 📝 **Candidatures** : Processus de candidature simplifié avec suivi du statut
- 👤 **Profil étudiant** : Gestion du profil et des informations personnelles
- 📱 **Design responsive** : Interface optimisée pour mobile, tablette et desktop

### Pour les Entreprises
- 📋 **Gestion des offres** : Création, modification et publication d'offres d'emploi
- 👥 **Gestion des candidatures** : Consultation et traitement des candidatures reçues
- 📊 **Dashboard entreprise** : Statistiques et suivi des performances
- 🏢 **Profil entreprise** : Gestion des informations de l'entreprise

### Fonctionnalités Générales
- 🔐 **Authentification sécurisée** : Connexion/inscription pour étudiants et entreprises
- ♿ **Accessibilité** : Contraste élevé et ajustement de la taille de police
- 🌐 **Interface multilingue** : Support français avec possibilité d'extension
- ⚡ **Performance optimisée** : Chargement rapide et navigation fluide

## 🛠 **Technologies Utilisées**

- **React 18** - Framework JavaScript
- **React Router** - Navigation côté client
- **Material-UI** - Composants d'interface utilisateur
- **Axios** - Client HTTP pour les appels API
- **Cypress** - Tests end-to-end
- **Jest** - Tests unitaires
- **CSS3** - Styles et animations

## 🚀 **Installation et Configuration**

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**
- **Backend API** en cours d'exécution sur le port 3001

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd adopteunetudiant/frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### Variables d'Environnement
```bash
# .env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

## 📜 **Scripts Disponibles**

### Développement
```bash
# Démarrer le serveur de développement
npm start
# Ouvre http://localhost:3000 dans le navigateur

# Construire pour la production
npm run build
# Génère les fichiers optimisés dans le dossier build/
```

### Tests
```bash
# Tests unitaires (Jest)
npm test                    # Mode interactif
npm test -- --coverage     # Avec rapport de couverture

# Tests E2E (Cypress) - Suite minimisée optimisée
npm run test:smoke          # Test rapide (4 tests en 3 secondes)
npm run test:e2e            # Mode interactif
npm run test:e2e:headless   # Mode headless (CI/CD)
npm run test:e2e:ci         # Mode CI avec enregistrement
npm run test:clean          # Nettoie les fichiers de tests générés
```

### Utilitaires
```bash
# Analyser la taille du bundle
npm run analyze

# Linter et formatage
npm run lint
npm run lint:fix
```

## 📁 **Structure du Projet**

```
frontend/
├── public/                     # Fichiers statiques
│   ├── index.html             # Template HTML principal
│   └── favicon.ico            # Icône de l'application
├── src/                       # Code source
│   ├── components/            # Composants réutilisables
│   │   ├── jobOffer/         # Composant d'affichage des offres
│   │   ├── navigation/       # Navigation et menu
│   │   └── common/           # Composants communs
│   ├── pages/                # Pages principales
│   │   ├── jobBoard/         # Page job board public
│   │   ├── login/            # Page de connexion
│   │   ├── companyJobs/      # Dashboard entreprise
│   │   └── studentDashboard/ # Dashboard étudiant
│   ├── services/             # Services API
│   │   ├── api.js           # Configuration Axios
│   │   ├── authService.js   # Service d'authentification
│   │   └── jobService.js    # Service des offres d'emploi
│   ├── utils/               # Utilitaires
│   ├── styles/              # Styles globaux
│   └── App.js              # Composant racine
├── cypress/                 # Tests E2E (suite minimisée)
│   ├── e2e/                # 5 fichiers de tests essentiels
│   │   ├── auth/           # Tests d'authentification (15 tests)
│   │   ├── job-board/      # Tests job board (4+ tests)
│   │   ├── dashboard/      # Tests dashboard (7 tests)
│   │   └── navigation/     # Tests navigation (16 tests)
│   ├── fixtures/           # Données de test (8 fichiers JSON)
│   ├── support/            # Commandes personnalisées
│   ├── videos/             # Vidéos générées (ignorées par Git)
│   └── screenshots/        # Captures d'écran (ignorées par Git)
├── package.json            # Dépendances et scripts
└── README.md              # Cette documentation
```

## 🧪 **Suite de Tests Optimisée**

### Statut Actuel des Tests
- ✅ **42/42 tests passent** (100% de réussite)
- ✅ **5 fichiers de tests essentiels** seulement
- ✅ **Exécution rapide** : smoke test en 3 secondes
- ✅ **Configuration .gitignore optimisée**

### Tests End-to-End (Cypress)
```bash
# Test de fumée rapide (recommandé pour vérification quotidienne)
npm run test:smoke
# ✅ 4 tests en 3 secondes - Fonctionnalités de base du job board

# Tests par catégorie
npx cypress run --spec "cypress/e2e/auth/login.cy.js"           # 15 tests - Authentification
npx cypress run --spec "cypress/e2e/job-board/job-board-smoke-test.cy.js" # 4 tests - Job board
npx cypress run --spec "cypress/e2e/dashboard/company-dashboard-smoke-test.cy.js" # 7 tests - Dashboard
npx cypress run --spec "cypress/e2e/navigation/routing.cy.js"   # 16 tests - Navigation
```

### Couverture des Tests
- **Authentification** : Connexion, validation, gestion d'erreurs, navigation clavier
- **Job Board** : Affichage des offres, recherche/filtrage, design responsive
- **Candidatures** : Processus de candidature étudiant complet
- **Dashboard Entreprise** : Gestion des offres, consultation des candidatures
- **Navigation** : Protection des routes, redirections, gardes d'authentification

### Configuration .gitignore pour les Tests
Les fichiers suivants sont automatiquement ignorés par Git :
```
cypress/videos/*           # Vidéos des tests (sauf .gitkeep)
cypress/screenshots/*      # Captures d'écran (sauf .gitkeep)
cypress/downloads/*        # Téléchargements (sauf .gitkeep)
coverage/                  # Rapports de couverture
**/*.test.js.snap         # Snapshots Jest
```

### Nettoyage des Fichiers de Tests
```bash
# Supprimer tous les fichiers générés par les tests
npm run test:clean

# Vérifier que rien n'est tracké par Git
git status
```

## 🎨 **Interface Utilisateur et Accessibilité**

### Design Responsive
- **Mobile First** : Interface optimisée pour les appareils mobiles
- **Breakpoints** : Support tablette (768px+) et desktop (1200px+)
- **Navigation adaptative** : Menu hamburger sur mobile, navigation complète sur desktop
- **Grilles flexibles** : Affichage adaptatif des offres d'emploi

### Fonctionnalités d'Accessibilité
- **Contraste élevé** : Mode de contraste élevé avec couleur de marque #E35226
- **Ajustement de police** : Possibilité d'augmenter la taille du texte
- **Navigation clavier** : Support complet de la navigation au clavier
- **Lecteurs d'écran** : Attributs ARIA et structure sémantique
- **Barre d'outils d'accessibilité** : Overlay sans affecter la mise en page

### Composants Principaux

#### JobOffer Component
- Affichage des informations d'offre d'emploi
- Boutons d'action (postuler, voir détails)
- Gestion des états (candidature déjà envoyée)
- Support responsive et accessibilité

#### JobBoard Component
- Liste paginée des offres d'emploi
- Filtres de recherche (domaine, type, localisation)
- Barre de recherche textuelle
- Gestion des états de chargement et d'erreur

#### CompanyJobs Component
- Dashboard de gestion des offres pour les entreprises
- Création et modification d'offres
- Gestion des candidatures reçues
- Statistiques et métriques

## 🔐 **Authentification et Sécurité**

### Système d'Authentification
- **JWT Tokens** : Authentification basée sur les tokens
- **Rôles utilisateur** : Distinction étudiant/entreprise
- **Protection des routes** : Gardes d'authentification
- **Gestion de session** : Persistance et expiration automatique

### Sécurité Frontend
- **Validation côté client** : Validation des formulaires
- **Sanitisation des données** : Protection contre XSS
- **HTTPS** : Communication sécurisée (production)
- **Variables d'environnement** : Configuration sécurisée

## 🛠 **Développement**

### Workflow de Développement
```bash
# 1. Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
npm start                    # Serveur de développement
npm run test:smoke          # Tests rapides

# 3. Vérifier la qualité du code
npm run lint                # Vérification du code
npm test -- --coverage     # Tests unitaires avec couverture

# 4. Construire pour la production
npm run build              # Build optimisé
```

### Bonnes Pratiques
- **Composants fonctionnels** : Utilisation des hooks React
- **Gestion d'état** : Context API pour l'état global
- **Styles modulaires** : CSS modules ou styled-components
- **Tests** : Tests unitaires pour les composants critiques
- **Accessibilité** : Respect des standards WCAG 2.1
- **Performance** : Lazy loading et optimisation des images

### Debugging
```bash
# Mode développement avec source maps
npm start

# Analyse du bundle
npm run analyze

# Tests en mode debug
npm run test:e2e -- --headed
```

## 🚀 **Déploiement**

### Build de Production
```bash
# Construire l'application
npm run build

# Les fichiers optimisés sont dans le dossier build/
# Prêts pour le déploiement sur un serveur web
```

### Variables d'Environnement de Production
```bash
REACT_APP_API_URL=https://api.adopteunetudiant.com/api
REACT_APP_ENVIRONMENT=production
```

### Serveurs Supportés
- **Nginx** : Configuration recommandée pour la production
- **Apache** : Support avec configuration .htaccess
- **Netlify/Vercel** : Déploiement automatique depuis Git
- **Docker** : Containerisation disponible

## 📚 **Documentation Complémentaire**

### Fichiers de Documentation
- `cypress/README.md` - Documentation complète des tests Cypress
- `cypress/CLEANUP_SUMMARY.md` - Résumé de l'optimisation des tests
- `cypress/TEST_FIXES_SUMMARY.md` - Corrections apportées aux tests
- `cypress/GITIGNORE_GUIDE.md` - Guide de configuration .gitignore

### Ressources Utiles
- [Documentation React](https://reactjs.org/docs)
- [Material-UI Components](https://mui.com/components/)
- [Cypress Testing](https://docs.cypress.io/)
- [Create React App](https://create-react-app.dev/docs/getting-started/)

## 🤝 **Contribution**

### Pour Contribuer
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code
- **ESLint** : Respect des règles de linting
- **Prettier** : Formatage automatique du code
- **Tests** : Couverture minimale de 80%
- **Documentation** : Commentaires pour les fonctions complexes

---

## 📞 **Support**

Pour toute question ou problème :
1. Consulter la documentation dans `cypress/`
2. Vérifier les issues GitHub existantes
3. Exécuter `npm run test:smoke` pour une vérification rapide
4. Utiliser `npm run test:clean` en cas de problème avec les fichiers de tests

**L'application frontend est maintenant prête pour le développement et la production !** 🎉
