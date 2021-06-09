import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create user", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "123"
    })

    expect(user).toHaveProperty("id");
  })

  it("should not be able to create a new user with email exists", async () => {

    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "123"
      })

      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "123"
      })
    }).rejects.toBeInstanceOf(CreateUserError)

  })
})
