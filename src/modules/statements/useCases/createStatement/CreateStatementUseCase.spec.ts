import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
  })

  it("should be able to create statement", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    const statement = await createStatementUseCase.execute({
      amount: 10,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id)
    })

    expect(statement).toHaveProperty("id");
  })

  it("should not be able to create statement with user nonexistent", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 10,
        description: "deposit test",
        type: OperationType.DEPOSIT,
        user_id: "id_user_nonexistent"
      })

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it("should not be able to create statement with balance insufficient", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        email: "test@test.com",
        name: "Test user",
        password: "123"
      });

      await createStatementUseCase.execute({
        amount: 10,
        description: "deposit test",
        type: OperationType.DEPOSIT,
        user_id: String(user.id)
      })

      await createStatementUseCase.execute({
        amount: 20,
        description: "withdraw test",
        type: OperationType.WITHDRAW,
        user_id: String(user.id)
      })

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})
