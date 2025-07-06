const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mockingoose = require("mockingoose");
const User = require("../api/users/users.model");

describe("Test API users", () => {
  let token;
  const USER_ID = "fake";
  const MOCK_DATA = [
    {
      _id: USER_ID,
      firstname: "John",
      lastname: "Doe",
      email: "johndoe@gmail.com",
      password: "password",
      profilePicture: "1672237090755avatar3.png",
      isStudent: true,
      status: true,
    },
  ];
  const MOCK_DATA_UPDATED = {
    firstname: "Jane",
    lastname: "Doe",
    email: "janedoe@gmail.com",
    password: "password",
    profilePicture: "1672237090755avatar3.png",
    isStudent: true,
    status: true,
  };

  beforeEach(() => {
    token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);
    mockingoose(User).toReturn(MOCK_DATA, "find");
    mockingoose(User).toReturn(MOCK_DATA_UPDATED, "findOneAndUpdate");
    mockingoose(User).toReturn(
      { message: "User deleted successfully." },
      "remove"
    );
  });

  it("Test getAllUsers method", async () => {
    const res = await request(app).get("/api/users").send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(MOCK_DATA);
  });

  it("Test getUserById method", async () => {
    const res = await request(app).get(`/api/users/${USER_ID}`).send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(MOCK_DATA);
  });

  it("Test updateUser method", async () => {
    const res = await request(app)
      .put("/api/users")
      .set("x-access-token", token)
      .send({
        firstname: "Jane",
        lastname: "Doe",
        email: "janedoe@gmail.com",
        password: "password",
        profilePicture: "1672237090755avatar3.png",
        isStudent: true,
        status: true,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(MOCK_DATA_UPDATED);
  });

  it("Test deleteUser method", async () => {
    const res = await request(app)
      .delete(`/api/users/${USER_ID}`)
      .set("x-access-token", token);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
});
