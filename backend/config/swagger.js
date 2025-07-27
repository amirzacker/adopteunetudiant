const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Adopte un Étudiant API',
      version: '1.0.0',
      description: 'API complète de la plateforme Adopte un Étudiant - Connecter étudiants et entreprises',
      contact: {
        name: 'Support API',
        email: 'support@adopte-etudiant.fr',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.adopte-etudiant.fr',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification. Format: Bearer {token}',
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Identifiant unique de l\'utilisateur',
              example: '507f1f77bcf86cd799439011'
            },
            firstname: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
              example: 'Jean'
            },
            lastname: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur',
              example: 'Dupont'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email unique',
              example: 'jean.dupont@email.com'
            },
            profilePicture: {
              type: 'string',
              description: 'URL de la photo de profil',
              example: '1672237090755avatar3.png'
            },
            cv: {
              type: 'string',
              description: 'URL du CV (pour les étudiants)',
              example: 'cv_jean_dupont.pdf'
            },
            motivationLetter: {
              type: 'string',
              description: 'URL de la lettre de motivation',
              example: 'lettre_motivation.pdf'
            },
            searchType: {
              $ref: '#/components/schemas/SearchType'
            },
            domain: {
              $ref: '#/components/schemas/Domain'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date de début de recherche',
              example: '2024-01-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Date de fin de recherche',
              example: '2024-06-15'
            },
            favoris: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Liste des IDs des favoris'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Indique si l\'utilisateur est administrateur',
              example: false
            },
            isStudent: {
              type: 'boolean',
              description: 'Indique si l\'utilisateur est étudiant',
              example: true
            },
            isCompany: {
              type: 'boolean',
              description: 'Indique si l\'utilisateur est une entreprise',
              example: false
            },
            status: {
              type: 'boolean',
              description: 'Statut actif/inactif du compte',
              example: true
            },
            name: {
              type: 'string',
              description: 'Nom de l\'entreprise (pour les entreprises)',
              example: 'TechCorp'
            },
            desc: {
              type: 'string',
              description: 'Description de l\'entreprise',
              example: 'Entreprise de développement logiciel'
            },
            city: {
              type: 'string',
              description: 'Ville',
              example: 'Paris'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date de naissance (pour les étudiants)',
              example: '1995-05-15'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            firstname: {
              type: 'string',
              example: 'Jean'
            },
            lastname: {
              type: 'string',
              example: 'Dupont'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jean.dupont@email.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'motdepasse123'
            },
            isStudent: {
              type: 'boolean',
              example: true
            },
            isCompany: {
              type: 'boolean',
              example: false
            },
            name: {
              type: 'string',
              description: 'Nom de l\'entreprise (requis si isCompany=true)',
              example: 'TechCorp'
            },
            city: {
              type: 'string',
              example: 'Paris'
            },
            domain: {
              type: 'string',
              description: 'ID du domaine',
              example: '507f1f77bcf86cd799439011'
            },
            searchType: {
              type: 'string',
              description: 'ID du type de recherche',
              example: '507f1f77bcf86cd799439012'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'jean.dupont@email.com'
            },
            password: {
              type: 'string',
              example: 'motdepasse123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT pour l\'authentification',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        // Domain and SearchType Schemas
        Domain: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Nom du domaine d\'activité',
              example: 'Informatique'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        DomainInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Informatique'
            }
          }
        },
        SearchType: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            name: {
              type: 'string',
              description: 'Type de recherche',
              example: 'Stage'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SearchTypeInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Stage'
            }
          }
        },
        // Job Offer Schemas
        JobOffer: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            },
            title: {
              type: 'string',
              description: 'Titre de l\'offre',
              example: 'Développeur Full Stack - Stage'
            },
            description: {
              type: 'string',
              description: 'Description détaillée de l\'offre',
              example: 'Nous recherchons un stagiaire développeur full stack...'
            },
            company: {
              $ref: '#/components/schemas/User'
            },
            location: {
              type: 'string',
              description: 'Lieu de travail',
              example: 'Paris, France'
            },
            requirements: {
              type: 'string',
              description: 'Exigences et compétences requises',
              example: 'Maîtrise de JavaScript, React, Node.js'
            },
            publicationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de publication'
            },
            jobType: {
              $ref: '#/components/schemas/SearchType'
            },
            domain: {
              $ref: '#/components/schemas/Domain'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'closed'],
              description: 'Statut de l\'offre',
              example: 'published'
            },
            salary: {
              type: 'string',
              description: 'Rémunération proposée',
              example: '800€/mois'
            },
            duration: {
              type: 'string',
              description: 'Durée du contrat',
              example: '6 mois'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date de début souhaitée',
              example: '2024-03-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Date de fin prévue',
              example: '2024-08-31'
            },
            applicationDeadline: {
              type: 'string',
              format: 'date',
              description: 'Date limite de candidature',
              example: '2024-02-15'
            },
            benefits: {
              type: 'string',
              description: 'Avantages proposés',
              example: 'Tickets restaurant, télétravail partiel'
            },
            workingHours: {
              type: 'string',
              description: 'Horaires de travail',
              example: '35h/semaine, 9h-17h'
            },
            applicationCount: {
              type: 'number',
              description: 'Nombre de candidatures reçues',
              example: 15
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        JobOfferInput: {
          type: 'object',
          required: ['title', 'description', 'location', 'requirements', 'jobType', 'domain', 'startDate', 'endDate'],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
              example: 'Développeur Full Stack - Stage'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              example: 'Nous recherchons un stagiaire développeur full stack...'
            },
            location: {
              type: 'string',
              maxLength: 100,
              example: 'Paris, France'
            },
            requirements: {
              type: 'string',
              maxLength: 1000,
              example: 'Maîtrise de JavaScript, React, Node.js'
            },
            jobType: {
              type: 'string',
              description: 'ID du type de poste',
              example: '507f1f77bcf86cd799439012'
            },
            domain: {
              type: 'string',
              description: 'ID du domaine',
              example: '507f1f77bcf86cd799439011'
            },
            salary: {
              type: 'string',
              maxLength: 50,
              example: '800€/mois'
            },
            duration: {
              type: 'string',
              maxLength: 50,
              example: '6 mois'
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2024-03-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2024-08-31'
            },
            applicationDeadline: {
              type: 'string',
              format: 'date',
              example: '2024-02-15'
            },
            benefits: {
              type: 'string',
              maxLength: 500,
              example: 'Tickets restaurant, télétravail partiel'
            },
            workingHours: {
              type: 'string',
              maxLength: 100,
              example: '35h/semaine, 9h-17h'
            }
          }
        },
        // Job Application Schemas
        JobApplication: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439014'
            },
            jobOffer: {
              $ref: '#/components/schemas/JobOffer'
            },
            student: {
              $ref: '#/components/schemas/User'
            },
            coverLetter: {
              type: 'string',
              description: 'Lettre de motivation',
              example: 'Je suis très intéressé par cette offre...'
            },
            resume: {
              type: 'string',
              description: 'URL du CV',
              example: 'cv_jean_dupont.pdf'
            },
            applicationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de candidature'
            },
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'accepted', 'rejected'],
              description: 'Statut de la candidature',
              example: 'pending'
            },
            reviewDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'examen de la candidature'
            },
            reviewNotes: {
              type: 'string',
              description: 'Notes de l\'examinateur',
              example: 'Profil intéressant, à recontacter'
            },
            interviewDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'entretien programmée'
            },
            interviewNotes: {
              type: 'string',
              description: 'Notes d\'entretien',
              example: 'Entretien positif, candidat motivé'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        JobApplicationInput: {
          type: 'object',
          required: ['jobOffer', 'student', 'coverLetter', 'resume'],
          properties: {
            jobOffer: {
              type: 'string',
              description: 'ID de l\'offre d\'emploi',
              example: '507f1f77bcf86cd799439013'
            },
            student: {
              type: 'string',
              description: 'ID de l\'étudiant',
              example: '507f1f77bcf86cd799439011'
            },
            coverLetter: {
              type: 'string',
              maxLength: 2000,
              example: 'Je suis très intéressé par cette offre...'
            },
            resume: {
              type: 'string',
              example: 'cv_jean_dupont.pdf'
            }
          }
        },
        JobApplicationStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'accepted', 'rejected'],
              example: 'reviewed'
            },
            reviewNotes: {
              type: 'string',
              maxLength: 1000,
              example: 'Profil intéressant, à recontacter'
            }
          }
        },
        InterviewSchedule: {
          type: 'object',
          required: ['interviewDate'],
          properties: {
            interviewDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-02-20T14:00:00Z'
            },
            interviewNotes: {
              type: 'string',
              maxLength: 1000,
              example: 'Entretien prévu en visioconférence'
            }
          }
        },
        // Adoption Schemas
        Adoption: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439015'
            },
            adopter: {
              $ref: '#/components/schemas/User'
            },
            adopted: {
              $ref: '#/components/schemas/User'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected'],
              description: 'Statut de l\'adoption',
              example: 'pending'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AdoptionInput: {
          type: 'object',
          required: ['adopter', 'adopted'],
          properties: {
            adopter: {
              type: 'string',
              description: 'ID de l\'adoptant (entreprise)',
              example: '507f1f77bcf86cd799439016'
            },
            adopted: {
              type: 'string',
              description: 'ID de l\'adopté (étudiant)',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        // Contract Schemas
        Contract: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439017'
            },
            company: {
              $ref: '#/components/schemas/User'
            },
            student: {
              $ref: '#/components/schemas/User'
            },
            terms: {
              type: 'string',
              description: 'Termes et conditions du contrat',
              example: 'Contrat de stage de 6 mois...'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date de début du contrat',
              example: '2024-03-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Date de fin du contrat',
              example: '2024-08-31'
            },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'terminated'],
              description: 'Statut du contrat',
              example: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ContractInput: {
          type: 'object',
          required: ['company', 'student', 'terms', 'startDate', 'endDate'],
          properties: {
            company: {
              type: 'string',
              description: 'ID de l\'entreprise',
              example: '507f1f77bcf86cd799439016'
            },
            student: {
              type: 'string',
              description: 'ID de l\'étudiant',
              example: '507f1f77bcf86cd799439011'
            },
            terms: {
              type: 'string',
              example: 'Contrat de stage de 6 mois...'
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2024-03-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2024-08-31'
            }
          }
        },
        // Message and Conversation Schemas
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439018'
            },
            conversationId: {
              type: 'string',
              description: 'ID de la conversation',
              example: '507f1f77bcf86cd799439019'
            },
            sender: {
              type: 'string',
              description: 'ID de l\'expéditeur',
              example: '507f1f77bcf86cd799439011'
            },
            text: {
              type: 'string',
              description: 'Contenu du message',
              example: 'Bonjour, j\'aimerais en savoir plus sur cette offre.'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        MessageInput: {
          type: 'object',
          required: ['conversationId', 'sender', 'text'],
          properties: {
            conversationId: {
              type: 'string',
              example: '507f1f77bcf86cd799439019'
            },
            sender: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            text: {
              type: 'string',
              example: 'Bonjour, j\'aimerais en savoir plus sur cette offre.'
            }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439019'
            },
            members: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'IDs des participants à la conversation',
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439016']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ConversationInput: {
          type: 'object',
          required: ['members'],
          properties: {
            members: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              maxItems: 2,
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439016']
            }
          }
        },
        // Statistics Schemas
        CompanyStats: {
          type: 'object',
          properties: {
            totalJobOffers: {
              type: 'number',
              example: 25
            },
            activeJobOffers: {
              type: 'number',
              example: 15
            },
            totalApplications: {
              type: 'number',
              example: 150
            },
            pendingApplications: {
              type: 'number',
              example: 45
            },
            acceptedApplications: {
              type: 'number',
              example: 12
            }
          }
        },
        StudentStats: {
          type: 'object',
          properties: {
            totalApplications: {
              type: 'number',
              example: 8
            },
            pendingApplications: {
              type: 'number',
              example: 3
            },
            acceptedApplications: {
              type: 'number',
              example: 2
            },
            rejectedApplications: {
              type: 'number',
              example: 3
            }
          }
        },
        // Error Response Schemas
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur',
              example: 'Ressource non trouvée'
            },
            message: {
              type: 'string',
              description: 'Description détaillée de l\'erreur',
              example: 'L\'utilisateur avec l\'ID spécifié n\'existe pas'
            },
            statusCode: {
              type: 'number',
              description: 'Code de statut HTTP',
              example: 404
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Erreur de validation'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'L\'email est requis'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: "Endpoints d'authentification et gestion des sessions" },
      { name: 'Users', description: 'Gestion des utilisateurs (étudiants et entreprises)' },
      { name: 'Job Offers', description: "Gestion des offres d'emploi et de stage" },
      { name: 'Job Applications', description: 'Gestion des candidatures aux offres' },
      { name: 'Adoptions', description: "Processus d'adoption étudiant-entreprise" },
      { name: 'Contracts', description: 'Gestion des contrats entre étudiants et entreprises' },
      { name: 'Messages', description: 'Système de messagerie en temps réel' },
      { name: 'Conversations', description: 'Gestion des conversations entre utilisateurs' },
      { name: 'Domains', description: 'Gestion des domaines d\'activité' },
      { name: 'Search Types', description: 'Gestion des types de recherche (stage, emploi, etc.)' },
      { name: 'Files', description: 'Upload et gestion des fichiers (CV, photos, etc.)' },
    ],
  },
  apis: [
    './api/users/*.js',
    './api/jobOffers/*.js',
    './api/jobApplications/*.js',
    './api/adoptions/*.js',
    './api/contracts/*.js',
    './api/messages/*.js',
    './api/conversations/*.js',
    './api/domains/*.js',
    './api/searchTypes/*.js',
    './server.js'
  ],
};

module.exports = swaggerJSDoc(swaggerOptions);
