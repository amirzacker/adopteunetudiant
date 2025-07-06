const express = require('express');
const searchTypesController = require('./searchTypes.controller');
const router = express.Router();
const roleCheck = require('../../middlewares/roleCheck');

router.post("/", roleCheck(['admin']), searchTypesController.create);
router.get("/", searchTypesController.getAll);
router.put("/:id", roleCheck(['admin']), searchTypesController.update);
router.delete("/:id", roleCheck(['admin']), searchTypesController.delete);

module.exports = router;
