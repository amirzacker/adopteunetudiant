const express = require('express');
const domainsController = require('./domains.controller');
const router = express.Router();
const roleCheck = require('../../middlewares/roleCheck');


router.post("/", roleCheck(['admin']), domainsController.create);
router.get("/", domainsController.getAll);
router.put("/:id", roleCheck(['admin']), domainsController.update);
router.delete("/:id", roleCheck(['admin']), domainsController.delete);

module.exports = router;
