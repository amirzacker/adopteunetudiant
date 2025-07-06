const express = require("express");
const contractController = require("./contracts.controller");
const router = express.Router();

router.post("/", contractController.createContract);
router.get("/:userId", contractController.getAllContracts);
router.get('/history/:companyId/:studentId', contractController.checkContractHistory);
router.get("/active/:userId", contractController.getAllActiveContracts);
router.get("/terminated/:userId", contractController.getAllTerminatedContracts);
router.put("/active/:contractId", contractController.updateActiveContract);
router.put("/terminated/:contractId", contractController.updateTerminatedContract);
router.delete('/:contractId', contractController.deleteContract);

module.exports = router;
