const express = require("express");
const adoptionController = require('./adoptions.controller');
const router = express.Router();

/**
 * @swagger
 * /api/adoptions:
 *   post:
 *     summary: Créer une nouvelle adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdoptionInput'
 *     responses:
 *       201:
 *         description: Adoption créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 */
router.post('/', adoptionController.createAdoption);

/**
 * @swagger
 * /api/adoptions/{userId}:
 *   get:
 *     summary: Récupérer toutes les adoptions d'un utilisateur
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Adoptions de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 */
router.get('/:userId', adoptionController.getAllAdoptions);

/**
 * @swagger
 * /api/adoptions/history/{companyId}/{studentId}:
 *   get:
 *     summary: Vérifier l'historique d'adoption entre une entreprise et un étudiant
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Historique d'adoption
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasHistory:
 *                   type: boolean
 *                 adoptions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Adoption'
 */
router.get('/history/:companyId/:studentId', adoptionController.checkAdoptionHistory);

/**
 * @swagger
 * /api/adoptions/find/{companyId}/{studentId}:
 *   get:
 *     summary: Trouver une adoption spécifique entre une entreprise et un étudiant
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Adoption trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       404:
 *         description: Adoption non trouvée
 */
router.get('/find/:companyId/:studentId', adoptionController.findAdoption);

/**
 * @swagger
 * /api/adoptions/{userId}/rejected:
 *   get:
 *     summary: Récupérer les adoptions rejetées d'un utilisateur
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Adoptions rejetées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 */
router.get('/:userId/rejected', adoptionController.getAllRejectedAdoptions);

/**
 * @swagger
 * /api/adoptions/{userId}/accepted:
 *   get:
 *     summary: Récupérer les adoptions acceptées d'un utilisateur
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Adoptions acceptées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 */
router.get('/:userId/accepted', adoptionController.getAllAcceptedAdoptions);

/**
 * @swagger
 * /api/adoptions/{adoptionId}/accepted:
 *   put:
 *     summary: Accepter une adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adoptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'adoption
 *     responses:
 *       200:
 *         description: Adoption acceptée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       404:
 *         description: Adoption non trouvée
 */
router.put('/:adoptionId/accepted', adoptionController.updateAcceptedAdoption);

/**
 * @swagger
 * /api/adoptions/{adoptionId}/rejected:
 *   put:
 *     summary: Rejeter une adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adoptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'adoption
 *     responses:
 *       200:
 *         description: Adoption rejetée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       404:
 *         description: Adoption non trouvée
 */
router.put('/:adoptionId/rejected', adoptionController.updateRejectedAdoption);

/**
 * @swagger
 * /api/adoptions/{adoptionId}:
 *   delete:
 *     summary: Supprimer une adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adoptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'adoption
 *     responses:
 *       200:
 *         description: Adoption supprimée
 *       404:
 *         description: Adoption non trouvée
 */
router.delete('/:adoptionId', adoptionController.deleteAdoption);

module.exports = router;
