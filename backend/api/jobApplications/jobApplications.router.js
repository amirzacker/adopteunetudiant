const express = require("express");
const authMiddleware = require("../../middlewares/auth");
const jobApplicationsController = require("./jobApplications.controller");
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/jobApplications/student/{studentId}:
 *   get:
 *     summary: Récupérer les candidatures d'un étudiant
 *     tags: [Job Applications]
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
 *         description: Candidatures de l'étudiant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 *       401:
 *         description: Non autorisé
 */
router.get("/student/:studentId", jobApplicationsController.getByStudent);

/**
 * @swagger
 * /api/jobApplications/student/{studentId}/stats:
 *   get:
 *     summary: Statistiques des candidatures d'un étudiant
 *     tags: [Job Applications]
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
 *         description: Statistiques de l'étudiant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentStats'
 */
router.get("/student/:studentId/stats", jobApplicationsController.getStudentStats);

/**
 * @swagger
 * /api/jobApplications/check/{studentId}/{jobOfferId}:
 *   get:
 *     summary: Vérifier si un étudiant a déjà candidaté à une offre
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *       - in: path
 *         name: jobOfferId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Statut de candidature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasApplied:
 *                   type: boolean
 *                 application:
 *                   $ref: '#/components/schemas/JobApplication'
 */
router.get("/check/:studentId/:jobOfferId", jobApplicationsController.checkApplication);

/**
 * @swagger
 * /api/jobApplications/company/{companyId}:
 *   get:
 *     summary: Récupérer les candidatures reçues par une entreprise
 *     tags: [Job Applications]
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
 *         description: Candidatures reçues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get("/company/:companyId", jobApplicationsController.getByCompany);

/**
 * @swagger
 * /api/jobApplications/company/{companyId}/stats:
 *   get:
 *     summary: Statistiques des candidatures d'une entreprise
 *     tags: [Job Applications]
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
router.get("/company/:companyId/stats", jobApplicationsController.getCompanyStats);

/**
 * @swagger
 * /api/jobApplications/company/{companyId}/recent:
 *   get:
 *     summary: Candidatures récentes d'une entreprise
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de candidatures à récupérer
 *     responses:
 *       200:
 *         description: Candidatures récentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get("/company/:companyId/recent", jobApplicationsController.getRecentApplications);

/**
 * @swagger
 * /api/jobApplications/jobOffer/{jobOfferId}:
 *   get:
 *     summary: Récupérer les candidatures pour une offre d'emploi
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobOfferId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Candidatures pour l'offre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get("/jobOffer/:jobOfferId", jobApplicationsController.getByJobOffer);

/**
 * @swagger
 * /api/jobApplications/{id}:
 *   get:
 *     summary: Récupérer une candidature par ID
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidature
 *     responses:
 *       200:
 *         description: Candidature trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Candidature non trouvée
 */
router.get("/:id", jobApplicationsController.getById);

/**
 * @swagger
 * /api/jobApplications:
 *   post:
 *     summary: Créer une nouvelle candidature
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobApplicationInput'
 *     responses:
 *       201:
 *         description: Candidature créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Données invalides ou candidature déjà existante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 */
router.post("/", jobApplicationsController.create);

/**
 * @swagger
 * /api/jobApplications/{id}:
 *   delete:
 *     summary: Supprimer une candidature
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidature
 *     responses:
 *       200:
 *         description: Candidature supprimée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Candidature non trouvée
 */
router.delete("/:id", jobApplicationsController.delete);

/**
 * @swagger
 * /api/jobApplications/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une candidature
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobApplicationStatusUpdate'
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Candidature non trouvée
 */
router.put("/:id/status", jobApplicationsController.updateStatus);

/**
 * @swagger
 * /api/jobApplications/{id}/interview:
 *   put:
 *     summary: Programmer un entretien pour une candidature
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewSchedule'
 *     responses:
 *       200:
 *         description: Entretien programmé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Candidature non trouvée
 */
router.put("/:id/interview", jobApplicationsController.scheduleInterview);

module.exports = router;
