import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123",
    };
    const { id } = await createUserUseCase.execute(user)


    const result = await showUserProfileUseCase.execute(String(id));

    expect(result).toHaveProperty("name");
    expect(result.email).toBe("user@test.com")
  })

  it("should not be able to show an nonexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("id_nonexistent");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
