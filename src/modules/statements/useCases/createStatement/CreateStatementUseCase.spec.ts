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

  it("should be able to create statement deposit", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    const statement_deposit = await createStatementUseCase.execute({
      amount: 10,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
      sender_id: String(user.id)
    })

    expect(statement_deposit).toHaveProperty("id");
    expect(statement_deposit.amount).toBe(10);
  })

  it("should be able to create statement withdraw", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });


    await createStatementUseCase.execute({
      amount: 10,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
      sender_id: String(user.id)
    })

    const statement_withdraw = await createStatementUseCase.execute({
      amount: 5,
      description: "Withdraw test",
      type: OperationType.WITHDRAW,
      user_id: String(user.id),
      sender_id: String(user.id)
    })

    expect(statement_withdraw).toHaveProperty("id");
    expect(statement_withdraw.amount).toBe(5);
  })

  it("should not be able to create statement with user nonexistent", async () => {
    const sender = await usersRepositoryInMemory.create({
      email: "sender@test.com",
      name: "Test sender",
      password: "123"
    });

    await expect(createStatementUseCase.execute({
        amount: 10,
        description: "deposit test",
        type: OperationType.DEPOSIT,
        user_id: String(sender.id),
        sender_id: "id_user_nonexistent"
      })

    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it("should not be able to create statement with balance insufficient", async () => {
    const sender = await usersRepositoryInMemory.create({
      email: "sender@test.com",
      name: "Test sender",
      password: "123"
    });

    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    await createStatementUseCase.execute({
      amount: 10,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
      sender_id: String(user.id)
    })

    await expect(createStatementUseCase.execute({
        amount: 20,
        description: "withdraw test",
        type: OperationType.WITHDRAW,
        user_id: String(user.id),
        sender_id: String(user.id)
      })

    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it("should be able to create statement transfer", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    const sender = await usersRepositoryInMemory.create({
      email: "sender@test.com",
      name: "Test sender",
      password: "123"
    });

    await createStatementUseCase.execute({
      amount: 11,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(sender.id),
      sender_id: String(sender.id)
    })


    const statement_transfer = await createStatementUseCase.execute({
      amount: 10,
      description: "Transfer",
      type: OperationType.TRANSFER,
      user_id: String(user.id),
      sender_id: String(sender.id)
    })

    expect(statement_transfer).toHaveProperty("id");
    expect(statement_transfer.amount).toBe(10);
  })

  it("should not be able to create statement transfer with balance insufficient", async () => {
    const sender = await usersRepositoryInMemory.create({
      email: "sender@test.com",
      name: "Test sender",
      password: "123"
    });

    const user = await usersRepositoryInMemory.create({
      email: "test@test.com",
      name: "Test user",
      password: "123"
    });

    await createStatementUseCase.execute({
      amount: 10,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: String(sender.id),
      sender_id: String(sender.id)
    })

    await expect(createStatementUseCase.execute({
        amount: 20,
        description: "transfer test",
        type: OperationType.TRANSFER,
        user_id: String(user.id),
        sender_id: String(sender.id)
      })

    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})
