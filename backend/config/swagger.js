const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Adopte un Étudiant API',
      version: '1.0.0',
      description: 'API de la plateforme Adopte un Étudiant',
      contact: {
        name: 'Support API',
        email: 'support@adopte-etudiant.fr',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: "Endpoints d'authentification" },
      { name: 'Utilisateurs', description: 'Gestion des utilisateurs' },
      { name: 'Étudiants', description: 'Gestion des profils étudiants' },
      { name: 'Entreprises', description: 'Gestion des profils entreprises' },
      { name: 'Offres', description: "Gestion des offres d'emploi" },
      { name: 'Candidatures', description: 'Gestion des candidatures' },
      {
        name: 'Adoptions',
        description: "Processus d'adoption étudiant-entreprise",
      },
      { name: 'Contrats', description: 'Gestion des contrats' },
      { name: 'Messages', description: 'Système de messagerie' },
      {
        name: 'Conversations',
        description: 'Gestion des conversations (messagerie)',
      },
      { name: 'Entretiens', description: 'Gestion des entretiens' },
      { name: 'Blog', description: 'Gestion des articles de blog' },
      { name: 'Commentaires', description: 'Gestion des commentaires de blog' },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

module.exports = swaggerJSDoc(swaggerOptions);
