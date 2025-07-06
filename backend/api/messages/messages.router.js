const express = require('express');
const messagesController = require('./messages.controller');
const router = express.Router();


router.get("/:conversationId", messagesController.get);
router.post("/", messagesController.create);


module.exports = router;
