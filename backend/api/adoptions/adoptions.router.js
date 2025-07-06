const express = require("express");
const adoptionController = require('./adoptions.controller');
const router = express.Router();

router.post('/', adoptionController.createAdoption);
router.get('/:userId', adoptionController.getAllAdoptions);
router.get('/history/:companyId/:studentId', adoptionController.checkAdoptionHistory);
router.get('/find/:companyId/:studentId', adoptionController.findAdoption);
router.get('/:userId/rejected', adoptionController.getAllRejectedAdoptions);
router.get('/:userId/accepted', adoptionController.getAllAcceptedAdoptions);
router.put('/:adoptionId/accepted', adoptionController.updateAcceptedAdoption);
router.put('/:adoptionId/rejected', adoptionController.updateRejectedAdoption);
router.delete('/:adoptionId', adoptionController.deleteAdoption);

module.exports = router;