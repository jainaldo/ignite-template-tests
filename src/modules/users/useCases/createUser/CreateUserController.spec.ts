
import createConnection from '../../../../database';
import request from "supertest";
import { app } from '../../../../app';
import { Connection } from 'typeorm';

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@test.com",
       password: "123"
    })

    expect(response.status).toBe(201);
  })

  it("should not be able to create a new user with email exists", async () => {

    const response = await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "test@test.com",
        password: "123"
    })

    expect(response.status).toBe(400);
  })

})
