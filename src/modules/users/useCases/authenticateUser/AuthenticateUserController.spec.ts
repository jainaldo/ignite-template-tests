
import createConnection from '../../../../database';
import request from "supertest";
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import {v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
      values('${id}', 'admin', 'admin@test.com.br','${password}')
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token")
  })

  it("should not be able to authenticate an nonexistent user", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user_nonexistent@test.com.br",
      password: "admin"
    })

    expect(response.status).toBe(401);
  })

  it("should be able to authenticate with incorrect password", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "incorrectPassword"
    })

    expect(response.status).toBe(401);
  })

})
