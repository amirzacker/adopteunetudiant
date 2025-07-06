const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const mockingoose = require("mockingoose").default;
const Contract = require("./contracts.model");
const ContractService = require("./contracts.service");
const { app } = require("../server");

const USER_ID = "5f1c3d3cfa3f04109c14f07c";
const COMPANY_ID = "5f1c3d3cfa3f04109c14f07d";
const MOCK_DATA = [
  {
    _id: "5f1c3d3cfa3f04109c14f07e",
    company: COMPANY_ID,
    student: USER_ID,
    terms: "This is a test contract",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    status: "pending",
  },
  {
    _id: "5f1c3d3cfa3f04109c14f07f",
    company: COMPANY_ID,
    student: USER_ID,
    terms: "This is another test contract",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    status: "active",
  },
];

describe("Contracts Route Test", () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ _id: USER_ID }, config.get("jwtPrivateKey"));
    mockingoose(Contract).toReturn(MOCK_DATA, "find");
  });

  it("Test get all contracts", async () => {
    const res = await request(app)
      .get(`/api/contracts/`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty("company", COMPANY_ID);
    expect(res.body[0]).toHaveProperty("student", USER_ID);
    expect(res.body[0]).toHaveProperty("terms");
    expect(res.body[0]).toHaveProperty("startDate");
    expect(res.body[0]).toHaveProperty("endDate");
    expect(res.body[0]).toHaveProperty("status", "pending");
  });

  it("Test create contract", async () => {
    const res = await request(app)
      .post(`/api/contracts/`)
      .send({
        company: COMPANY_ID,
        student: USER_ID,
        terms: "This is a test contract",
        startDate: "2022-01-01",
        endDate: "2022-12-31",
      })
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("company", COMPANY_ID);
    expect(res.body).toHaveProperty("student", STUDENT_ID);
    expect(res.body).toHaveProperty("status", "registered");
    expect(res.body).toHaveProperty("course", COURSE_ID);
    expect(res.body).toHaveProperty("timestamp");
    const contractId = res.body._id;

    const checkDb = await Contract.findById(contractId);
    expect(checkDb.company.toString()).toBe(COMPANY_ID);
    expect(checkDb.student.toString()).toBe(STUDENT_ID);
    expect(checkDb.terms).toBe("This is a test contract");
    expect(checkDb.startDate.toISOString()).toBe("2022-01-01T00:00:00.000Z");
    expect(checkDb.endDate.toISOString()).toBe("2022-12-31T00:00:00.000Z");
  });

  it("Test update contract", async () => {
    const res = await request(app)
      .put(`/api/contracts/${contractId}`)
      .send({
        terms: "This is an updated test contract",
      })
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      "terms",
      "This is an updated test contract"
    );

    const checkDb = await Contract.findById(contractId);
    expect(checkDb.terms).toBe("This is an updated test contract");
  });

  it("Test get contract by id", async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("company", COMPANY_ID);
    expect(res.body).toHaveProperty("student", STUDENT_ID);
    expect(res.body).toHaveProperty("status", "registered");
    expect(res.body).toHaveProperty(
      "terms",
      "This is an updated test contract"
    );
  });
  it("Test delete contract", async () => {
    const res = await request(app)
      .delete(`/api/contracts/${contractId}`)
      .set("x-access-token", token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Contract successfully deleted");

    const checkDb = await Contract.findById(contractId);
    expect(checkDb).toBeNull();
  });
});
