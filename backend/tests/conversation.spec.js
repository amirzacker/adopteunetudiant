const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const mockingoose = require("mockingoose").default;
const Message = require("./messages.schema");
const Conversation = require("./conversations.schema");
const { app } = require("../server");

const USER_ID = "5f1c3d3cfa3f04109c14f07c";
const MESSAGE_ID = "5f1c3d3cfa3f04109c14f07d";
const CONVERSATION_ID = "5f1c3d3cfa3f04109c14f07e";
const MOCK_MESSAGE_DATA = [
  {
    _id: MESSAGE_ID,
    conversationId: CONVERSATION_ID,
    sender: USER_ID,
    text: "Hello",
  },
  {
    _id: "5f1c3d3cfa3f04109c14f07f",
    conversationId: CONVERSATION_ID,
    sender: "5f1c3d3cfa3f04109c14f080",
    text: "Hi",
  },
];
const MOCK_CONVERSATION_DATA = {
  _id: CONVERSATION_ID,
  members: [USER_ID, "5f1c3d3cfa3f04109c14f080"],
};
const token = jwt.sign({ id: USER_ID }, config.get("jwtSecret"));

describe("Conversation API routes", () => {
  beforeEach(() => {
    mockingoose(Message).toReturn(MOCK_MESSAGE_DATA, "find");
    mockingoose(Message).toReturn(MOCK_MESSAGE_DATA[0], "save");
    mockingoose(Conversation).toReturn(MOCK_CONVERSATION_DATA, "findOne");
    mockingoose(Conversation).toReturn(MOCK_CONVERSATION_DATA, "save");
  });

  it("Test getUserConv method", async () => {
    const res = await request(app)
      .get(`/api/conversations/${USER_ID}`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("members");
  });

  it("Test getUsersConv method", async () => {
    const res = await request(app)
      .get(`/api/conversations/find/${USER_ID}/5f1c3d3cfa3f04109c14f080`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("members");
  });

  it("Test create method", async () => {
    const res = await request(app)
      .post("/api/conversations/")
      .set("x-access-token", token)
      .send({
        senderId: USER_ID,
        receiverId: "5f1c3d3cfa3f04109c14f07e",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("members");
    expect(res.body.members).toContain(USER_ID);
  });

  it("Test getUserConv method", async () => {
    const res = await request(app)
      .get(`/api/conversations/${USER_ID}`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0]).toHaveProperty("members");
  });

  it("Test getUsersConv method", async () => {
    const res = await request(app)
      .get(`/api/conversations/find/${FIRST_USER_ID}/${SECOND_USER_ID}`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("members");
    expect(res.body.members).toContain(FIRST_USER_ID);
    expect(res.body.members).toContain(SECOND_USER_ID);
  });

  it("Test getUserConv method", async () => {
    const res = await request(app)
      .get(`/api/conversations/${USER_ID}`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0]).toHaveProperty("members");
    expect(res.body[0].members).toContain(USER_ID);
  });
});
