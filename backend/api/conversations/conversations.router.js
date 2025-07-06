const express = require('express');
const conversationsController = require('./conversations.controller');
const router = express.Router();


router.get("/:userId", conversationsController.getUserConv);
router.get("/find/:firstUserId/:secondUserId", conversationsController.getUsersConv);
router.post("/", conversationsController.create);


module.exports = router;
