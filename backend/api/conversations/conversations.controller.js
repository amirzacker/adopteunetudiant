const conversationService = require("./conversations.service");

class MessagesController {
    //get conv of a user
    async getUserConv(req, res, next) {
        try {
          const conversations = await conversationService.getUserConv(req.params.userId);
          res.json(conversations);
        } catch (err) {
          next(err);
        }
      }
    // get conv includes two userId

    async getUsersConv(req, res, next) {
      try {
        const conversations = await conversationService.getUsersConv(req.params.firstUserId, req.params.secondUserId);
        res.json(conversations);
      } catch (err) {
        next(err);
      }
    }

   //new conv
    async create(req, res, next){
        try {
            const conversations = await conversationService.create(req.body.senderId, req.body.receiverId);
            req.io.emit('conversation:create', conversations);
            res.status(201).json(conversations);
            
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new MessagesController()
