import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let getBalaceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    getBalaceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
  })

  it("should be able get balance user", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    const user_sender = await usersRepositoryInMemory.create({
      email: "user_sender@test.com",
      name: "Test user",
      password: "123"
    });
    await createStatementUseCase.execute({
      amount: 20,
      description: 'deposit test',
      type: OperationType.DEPOSIT,
      user_id: String(user_sender.id),
      sender_id: String(user_sender.id)
    })

    await createStatementUseCase.execute({
      amount: 10,
      description: 'transfer test',
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
      sender_id: String(user_sender.id)
    })

    const { balance } = await getBalaceUseCase.execute({
      user_id: String(user.id)
    })

    expect(balance).toBe(10);
  })

  it("should not be able get balance user nonexistent", async () => {
    expect(async () => {
      await getBalaceUseCase.execute({
        user_id: "id_user_nonexistent"
      })
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})
