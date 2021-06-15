import createConnection from '../../../../database';
import request from "supertest";
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import {v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';
import authConfig from '../../../../config/auth';
import { sign } from 'jsonwebtoken';

let connection: Connection;
let token: any;
let id_statement: string;
let id: string;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    id = uuidV4();
    const password = await hash("test", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
      values('${id}', 'test', 'test@test.com.br','${password}')
    `
    );

    id_statement = uuidV4();

    await connection.query(
      `INSERT INTO STATEMENTS(id, amount, description, type, user_id)
      values('${id_statement}', '10', 'deposit test','deposit', '${id}')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able get statement operation user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).get(`/api/v1/statements/${id_statement}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id_statement);
    expect(response.body.type).toBe('deposit');
  })

  it("should not be able get statement operation user nonexistent", async () => {
    const id_user_nonexistent = uuidV4();

    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id_user_nonexistent,
      expiresIn,
    });

    const response = await request(app).get(`/api/v1/statements/${id_statement}`).set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(404);

  })

  it("should not be able get statement operation nonexistent", async () => {
    const id_statement_nonexistent = uuidV4();

    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).get(`/api/v1/statements/${id_statement_nonexistent}`).set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(404);
  })
})
