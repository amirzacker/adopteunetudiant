const Message = require("./messages.schema");

class MessageService {

  get(id) {
    return Message.find({conversationId: id});
  }
  create(data) {
    const message = new Message(data);
    return message.save();
  }
}

module.exports = new MessageService();
