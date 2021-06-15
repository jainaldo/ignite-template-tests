
import createConnection from '../../../../database';
import request from "supertest";
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import {v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';
import authConfig from '../../../../config/auth';
import { sign } from 'jsonwebtoken';

let connection: Connection;

describe("Show User Profile Controller", () => {
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

  it("should be able to show user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin"
    })

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200);
  })

  it("should not be able to show an nonexistent user", async () => {

    const { secret, expiresIn } = authConfig.jwt;

    const id = uuidV4();

    const token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404);
  })

})
