const messagesService = require("./messages.service");

class MessagesController {

    async get(req, res, next) {
        try {
          const messages = await messagesService.get(req.params.conversationId);
          res.json(messages);
        } catch (err) {
          next(err);
        }
      }

    async create(req, res, next){
        try {
            const messages = await messagesService.create(req.body);
            req.io.emit('message:create', messages);
            res.status(201).json(messages);
            
        } catch (error) {
            next(error)
        }
    }


    

}

module.exports = new MessagesController()
