import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let usersRepositoryInMemory: InMemoryUsersRepository;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get statement operation", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
  })

  it("should be able get statement operation user", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    const statement = await createStatementUseCase.execute({
      amount: 10,
      description: 'deposit test',
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
      sender_id: String(user.id)
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    })

    expect(statementOperation.amount).toBe(10);
    expect(statementOperation.user_id).toBe(user.id);
    expect(statementOperation.id).toBe(statement.id);
  })

  it("should not be able get statement operation user nonexistent", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "id_user_nonexistent",
        statement_id: "123"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it("should not be able get statement operation nonexistent", async () => {
    expect(async () => {

      const user = await usersRepositoryInMemory.create({
        email: "test@test.com",
        name: "Test user",
        password: "123"
      });

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "id_statment_nonexistent"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})
