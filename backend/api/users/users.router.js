const express = require("express");
const authMiddelware = require("../../middlewares/auth");
const usersController = require("./users.controller");
const router = express.Router();

router.get("/favoris/:companyId",authMiddelware, usersController.favoris);
router.get("/domain/:domainId", usersController.getByDomain);
router.put("/:id/addfavoris",authMiddelware, usersController.addfavoris);
router.get("/", usersController.getAll);
router.get("/:id", usersController.getById);
router.get("/email/:email", usersController.getByEmail);
router.post("/", usersController.create);
router.put("/:id", authMiddelware ,usersController.update);
router.put("/:id/unfavoris",authMiddelware, usersController.unfavoris);
router.delete("/:id",authMiddelware, usersController.delete);

module.exports = router;
