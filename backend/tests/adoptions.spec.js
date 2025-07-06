const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const mockingoose = require("mockingoose").default;
const Adoption = require("./adoptions.model");
const { app } = require("../server");

const USER_ID = "5f1c3d3cfa3f04109c14f07c";
const ADOPTION_ID = "5f1c3d3cfa3f04109c14f07d";
const MOCK_DATA = [
  {
    _id: ADOPTION_ID,
    adopter: USER_ID,
    adopted: "5f1c3d3cfa3f04109c14f07e",
    status: "pending",
  },
  {
    _id: "5f1c3d3cfa3f04109c14f07f",
    adopter: USER_ID,
    adopted: "pending",
  },
];

const MOCK_DATA_CREATED = {
  _id: ADOPTION_ID,
  adopter: USER_ID,
  adopted: "5f1c3d3cfa3f04109c14f07e",
  status: "pending",
};
const token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);

describe("Adoptions service", () => {
  beforeEach(() => {
    mockingoose(Adoption).toReturn(MOCK_DATA, "find");
    mockingoose(Adoption).toReturn(MOCK_DATA_CREATED, "save");
    mockingoose(Adoption).toReturn(MOCK_DATA_CREATED, "findOneAndUpdate");
    mockingoose(Adoption).toReturn(MOCK_DATA_CREATED, "findOneAndDelete");
  });

  it("Test createAdoption method", async () => {
    const res = await request(app)
      .post("/api/adoptions")
      .send({
        adopterId: USER_ID,
        adoptedId: "5f1c3d3cfa3f04109c14f07e",
      })
      .set("x-access-token", token);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(MOCK_DATA_CREATED);
  });

  it("Test getAllAdoptions method", async () => {
    const res = await request(app)
      .get("/api/adoptions")
      .set("x-access-token", token);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(MOCK_DATA);
  });

  it("Test getAllRejectedAdoptions method", async () => {
    const res = await request(app)
      .get("/api/adoptions/rejected")
      .set("x-access-token", token);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject([
      {
        _id: ADOPTION_ID,
        adopter: USER_ID,
        adopted: "5f1c3d3cfa3f04109c14f07e",
        status: "rejected",
      },
    ]);
  });

  it("Test getAllAcceptedAdoptions method", async () => {
    const res = await request(app)
      .get("/api/adoptions/accepted")
      .set("x-access-token", token);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject([
      {
        _id: ADOPTION_ID,
        adopter: USER_ID,
        adopted: "5f1c3d3cfa3f04109c14f07e",
        status: "accepted",
      },
    ]);
  });

  it("Test updateAcceptedAdoption method", async () => {
    const res = await request(app)
      .put(`/api/adoptions/${ADOPTION_ID}/accepted`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("adopter");
    expect(res.body).toHaveProperty("adopted");
    expect(res.body).toHaveProperty("status", "accepted");
  });

  it("Test updateRejectedAdoption method", async () => {
    const res = await request(app)
      .put(`/api/adoptions/${ADOPTION_ID}/rejected`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("adopter");
    expect(res.body).toHaveProperty("adopted");
    expect(res.body).toHaveProperty("status", "rejected");
  });

  it("Test deleteAdoption method", async () => {
    const res = await request(app)
      .delete(`/api/adoptions/${ADOPTION_ID}`)
      .set("x-access-token", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("adopter");
    expect(res.body).toHaveProperty("adopted");
  });
});
