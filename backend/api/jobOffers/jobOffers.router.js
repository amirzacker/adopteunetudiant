const express = require("express");
const authMiddleware = require("../../middlewares/auth");
const jobOffersController = require("./jobOffers.controller");
const router = express.Router();

/**
 * @swagger
 * /api/jobOffers:
 *   get:
 *     summary: Récupérer toutes les offres d'emploi
 *     tags: [Job Offers]
 *     description: Récupère toutes les offres d'emploi publiées (accès public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'offres par page
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filtrer par domaine
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *         description: Filtrer par type de poste
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrer par localisation
 *     responses:
 *       200:
 *         description: Liste des offres d'emploi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobOffer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalOffers:
 *                       type: integer
 */
router.get("/", jobOffersController.getAll);

/**
 * @swagger
 * /api/jobOffers/search:
 *   get:
 *     summary: Rechercher des offres d'emploi
 *     tags: [Job Offers]
 *     description: Recherche textuelle dans les offres d'emploi
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filtrer par domaine
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrer par localisation
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOffer'
 */
router.get("/search", jobOffersController.search);

/**
 * @swagger
 * /api/jobOffers/{id}:
 *   get:
 *     summary: Récupérer une offre d'emploi par ID
 *     tags: [Job Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre d'emploi trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       404:
 *         description: Offre d'emploi non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", jobOffersController.getById);

// Protected routes (authentication required)
router.use(authMiddleware);

/**
 * @swagger
 * /api/jobOffers/company/{companyId}:
 *   get:
 *     summary: Récupérer les offres d'une entreprise
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Offres de l'entreprise
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Non autorisé
 */
router.get("/company/:companyId", jobOffersController.getByCompany);

/**
 * @swagger
 * /api/jobOffers/company/{companyId}/stats:
 *   get:
 *     summary: Statistiques des offres d'une entreprise
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Statistiques de l'entreprise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyStats'
 */
router.get("/company/:companyId/stats", jobOffersController.getCompanyStats);

/**
 * @swagger
 * /api/jobOffers/student/{studentId}/recommended:
 *   get:
 *     summary: Offres recommandées pour un étudiant
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Offres recommandées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOffer'
 */
router.get("/student/:studentId/recommended", jobOffersController.getRecommendedJobs);

/**
 * @swagger
 * /api/jobOffers:
 *   post:
 *     summary: Créer une nouvelle offre d'emploi
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobOfferInput'
 *     responses:
 *       201:
 *         description: Offre créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 */
router.post("/", jobOffersController.create);

/**
 * @swagger
 * /api/jobOffers/{id}:
 *   put:
 *     summary: Mettre à jour une offre d'emploi
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobOfferInput'
 *     responses:
 *       200:
 *         description: Offre mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Offre non trouvée
 */
router.put("/:id", jobOffersController.update);

/**
 * @swagger
 * /api/jobOffers/{id}:
 *   delete:
 *     summary: Supprimer une offre d'emploi
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre supprimée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Offre non trouvée
 */
router.delete("/:id", jobOffersController.delete);

/**
 * @swagger
 * /api/jobOffers/{id}/publish:
 *   put:
 *     summary: Publier une offre d'emploi
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre publiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Offre non trouvée
 */
router.put("/:id/publish", jobOffersController.publish);

/**
 * @swagger
 * /api/jobOffers/{id}/close:
 *   put:
 *     summary: Fermer une offre d'emploi
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre fermée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Offre non trouvée
 */
router.put("/:id/close", jobOffersController.close);

module.exports = router;
