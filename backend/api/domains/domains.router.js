const express = require('express');
const domainsController = require('./domains.controller');
const router = express.Router();
const roleCheck = require('../../middlewares/roleCheck');

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Récupérer tous les domaines d'activité
 *     tags: [Domains]
 *     description: Récupère la liste de tous les domaines d'activité disponibles (accès public)
 *     responses:
 *       200:
 *         description: Liste des domaines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Domain'
 */
router.get("/", domainsController.getAll);

/**
 * @swagger
 * /api/domains:
 *   post:
 *     summary: Créer un nouveau domaine d'activité
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     description: Créer un nouveau domaine (accès administrateur uniquement)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DomainInput'
 *     responses:
 *       201:
 *         description: Domaine créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
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
router.post("/", roleCheck(['admin']), domainsController.create);

/**
 * @swagger
 * /api/domains/{id}:
 *   put:
 *     summary: Mettre à jour un domaine d'activité
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du domaine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DomainInput'
 *     responses:
 *       200:
 *         description: Domaine mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (administrateur requis)
 *       404:
 *         description: Domaine non trouvé
 */
router.put("/:id", roleCheck(['admin']), domainsController.update);

/**
 * @swagger
 * /api/domains/{id}:
 *   delete:
 *     summary: Supprimer un domaine d'activité
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du domaine
 *     responses:
 *       200:
 *         description: Domaine supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (administrateur requis)
 *       404:
 *         description: Domaine non trouvé
 */
router.delete("/:id", roleCheck(['admin']), domainsController.delete);

module.exports = router;
