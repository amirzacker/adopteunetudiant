const Conversation = require("./conversations.schema");

class ConversationService {

  getUserConv(id) {
    return Conversation.find({
      members: { $in: [id] },
    });
  }

  getUsersConv(firstUserId, secondUserId) {
    return Conversation.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });
  }
  create(senderId, receiverId) {
    const conversation = new Conversation({
      members: [senderId, receiverId],
    });
    return conversation.save();
  }
}

module.exports = new ConversationService();
