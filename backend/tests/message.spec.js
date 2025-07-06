const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const mockingoose = require("mockingoose").default;
const Message = require("./messages.model");
const { app } = require("../server");

const USER_ID = "5f1c3d3cfa3f04109c14f07c";
const CONVERSATION_ID = "5f1c3d3cfa3f04109c14f07d";
const MOCK_DATA = [
  {
    _id: "5f1c3d3cfa3f04109c14f07e",
    conversationId: CONVERSATION_ID,
    sender: USER_ID,
    text: "Hello World",
  },
  {
    _id: "5f1c3d3cfa3f04109c14f07f",
    conversationId: CONVERSATION_ID,
    sender: USER_ID,
    text: "How are you?",
  },
];

describe("Messages Route Test", () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ _id: USER_ID }, config.get("jwtPrivateKey"));
    mockingoose(Message).toReturn(MOCK_DATA, "find");
  });

  it("Test get messages", async () => {
    const res = await request(app)
      .get(`/api/messages/${CONVERSATION_ID}`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty("conversationId", CONVERSATION_ID);
    expect(res.body[0]).toHaveProperty("sender", USER_ID);
    expect(res.body[0]).toHaveProperty("text");
  });

  it("Test create message", async () => {
    const res = await request(app)
      .post(`/api/messages/`)
      .send({ conversationId: CONVERSATION_ID, sender: USER_ID, text: "Hello" })
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("conversationId", CONVERSATION_ID);
    expect(res.body).toHaveProperty("sender", USER_ID);
    expect(res.body).toHaveProperty("text", "Hello");
  });
});
