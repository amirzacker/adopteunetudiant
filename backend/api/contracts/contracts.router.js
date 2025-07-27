const express = require("express");
const contractController = require("./contracts.controller");
const router = express.Router();

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Créer un nouveau contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractInput'
 *     responses:
 *       201:
 *         description: Contrat créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 */
router.post("/", contractController.createContract);

/**
 * @swagger
 * /api/contracts/{userId}:
 *   get:
 *     summary: Récupérer tous les contrats d'un utilisateur
 *     tags: [Contracts]
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
 *         description: Contrats de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 */
router.get("/:userId", contractController.getAllContracts);

/**
 * @swagger
 * /api/contracts/history/{companyId}/{studentId}:
 *   get:
 *     summary: Vérifier l'historique des contrats entre une entreprise et un étudiant
 *     tags: [Contracts]
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
 *         description: Historique des contrats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasHistory:
 *                   type: boolean
 *                 contracts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contract'
 */
router.get('/history/:companyId/:studentId', contractController.checkContractHistory);

/**
 * @swagger
 * /api/contracts/active/{userId}:
 *   get:
 *     summary: Récupérer les contrats actifs d'un utilisateur
 *     tags: [Contracts]
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
 *         description: Contrats actifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 */
router.get("/active/:userId", contractController.getAllActiveContracts);

/**
 * @swagger
 * /api/contracts/terminated/{userId}:
 *   get:
 *     summary: Récupérer les contrats terminés d'un utilisateur
 *     tags: [Contracts]
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
 *         description: Contrats terminés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 */
router.get("/terminated/:userId", contractController.getAllTerminatedContracts);

/**
 * @swagger
 * /api/contracts/active/{contractId}:
 *   put:
 *     summary: Activer un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Contrat activé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Contrat non trouvé
 */
router.put("/active/:contractId", contractController.updateActiveContract);

/**
 * @swagger
 * /api/contracts/terminated/{contractId}:
 *   put:
 *     summary: Terminer un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Contrat terminé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Contrat non trouvé
 */
router.put("/terminated/:contractId", contractController.updateTerminatedContract);

/**
 * @swagger
 * /api/contracts/{contractId}:
 *   delete:
 *     summary: Supprimer un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Contrat supprimé
 *       404:
 *         description: Contrat non trouvé
 */
router.delete('/:contractId', contractController.deleteContract);

module.exports = router;
