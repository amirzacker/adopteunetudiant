const express = require('express');
const searchTypesController = require('./searchTypes.controller');
const router = express.Router();
const roleCheck = require('../../middlewares/roleCheck');

/**
 * @swagger
 * /api/searchTypes:
 *   get:
 *     summary: Récupérer tous les types de recherche
 *     tags: [Search Types]
 *     description: Récupère la liste de tous les types de recherche disponibles (stage, emploi, etc.) - accès public
 *     responses:
 *       200:
 *         description: Liste des types de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SearchType'
 */
router.get("/", searchTypesController.getAll);

/**
 * @swagger
 * /api/searchTypes:
 *   post:
 *     summary: Créer un nouveau type de recherche
 *     tags: [Search Types]
 *     security:
 *       - bearerAuth: []
 *     description: Créer un nouveau type de recherche (accès administrateur uniquement)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchTypeInput'
 *     responses:
 *       201:
 *         description: Type de recherche créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchType'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (administrateur requis)
 */
router.post("/", roleCheck(['admin']), searchTypesController.create);

/**
 * @swagger
 * /api/searchTypes/{id}:
 *   put:
 *     summary: Mettre à jour un type de recherche
 *     tags: [Search Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du type de recherche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchTypeInput'
 *     responses:
 *       200:
 *         description: Type de recherche mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchType'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (administrateur requis)
 *       404:
 *         description: Type de recherche non trouvé
 */
router.put("/:id", roleCheck(['admin']), searchTypesController.update);

/**
 * @swagger
 * /api/searchTypes/{id}:
 *   delete:
 *     summary: Supprimer un type de recherche
 *     tags: [Search Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du type de recherche
 *     responses:
 *       200:
 *         description: Type de recherche supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (administrateur requis)
 *       404:
 *         description: Type de recherche non trouvé
 */
router.delete("/:id", roleCheck(['admin']), searchTypesController.delete);

module.exports = router;
