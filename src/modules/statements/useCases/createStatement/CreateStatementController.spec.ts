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
// let id_statement: string;
let id: string;
// let id_sender: string;

describe("Create Statement Controller", () => {
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
    // id_sender = uuidV4();
    // await connection.query(
    //   `INSERT INTO USERS(id, name, email, password)
    //   values('${id_sender}', 'sender', 'sender@test.com.br','${password}')
    // `
    // );

    // id_statement = uuidV4();

    // await connection.query(
    //   `INSERT INTO STATEMENTS(id, amount, description, type, user_id, sender_id)
    //   values('${id_statement}', '10', 'deposit test','deposit', '${id}', '${id_sender}')
    // `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create statement deposit", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).post(`/api/v1/statements/deposit`).send({
      amount: 10,
      description: "deposit test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(10);
  })

  it("should be able to create statement withdraw", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).post(`/api/v1/statements/withdraw`).send({
      amount: 5,
      description: "withdraw test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(5);
  })

  it("should not be able to create statement with user nonexistent", async () => {
    const id_user_nonexistent = uuidV4();
    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id_user_nonexistent,
      expiresIn,
    });

    const response = await request(app).post(`/api/v1/statements/deposit`).send({
      amount: 10,
      description: "deposit test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  })

  it("should not be able to create statement with balance insufficient", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    token = sign({}, secret, {
      subject: id,
      expiresIn,
    });

    const response = await request(app).post(`/api/v1/statements/withdraw`).send({
      amount: 100,
      description: "withdraw test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
  })

  // it("should be able to create statement transfer", async () => {
  //   const { secret, expiresIn } = authConfig.jwt;

  //   token = sign({}, secret, {
  //     subject: id,
  //     expiresIn,
  //   });

  //   const response = await request(app).post(`/api/v1/statements/transfers/${id}`).send({
  //     amount: 5,
  //     description: "Tranferencia"
  //   }).set({
  //     Authorization: `Bearer ${token}`
  //   });

  //   expect(response.status).toBe(201);
  //   expect(response.body.amount).toBe(5);
  // })

})
