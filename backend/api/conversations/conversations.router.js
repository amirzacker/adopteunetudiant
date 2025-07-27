const express = require('express');
const conversationsController = require('./conversations.controller');
const router = express.Router();

/**
 * @swagger
 * /api/conversations/{userId}:
 *   get:
 *     summary: Récupérer les conversations d'un utilisateur
 *     tags: [Conversations]
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
 *         description: Conversations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Non autorisé
 */
router.get("/:userId", conversationsController.getUserConv);

/**
 * @swagger
 * /api/conversations/find/{firstUserId}/{secondUserId}:
 *   get:
 *     summary: Trouver une conversation entre deux utilisateurs
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: firstUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du premier utilisateur
 *       - in: path
 *         name: secondUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du second utilisateur
 *     responses:
 *       200:
 *         description: Conversation trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation non trouvée
 */
router.get("/find/:firstUserId/:secondUserId", conversationsController.getUsersConv);

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Créer une nouvelle conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversationInput'
 *     responses:
 *       201:
 *         description: Conversation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 */
router.post("/", conversationsController.create);

module.exports = router;
