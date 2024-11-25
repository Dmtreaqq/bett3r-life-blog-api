import { UsersRepository } from "./repositories/usersRepository";
import { UserDbModel } from "./models/UserDbModel";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { HashService } from "../../common/services/hashService";
import { randomUUID } from "node:crypto";
import { UserApiRequestModel } from "./models/UserApiRequestModel";

export class UsersService {
  private usersRepository: UsersRepository;
  private hashService: HashService;

  constructor() {
    this.usersRepository = new UsersRepository();
    this.hashService = new HashService();
  }

  async createUser(userInput: UserApiRequestModel): Promise<string> {
    const userByEmail = await this.usersRepository.getUserByEmail(userInput.email);
    const userByLogin = await this.usersRepository.getUserByLogin(userInput.login);

    if (userByEmail || userByLogin) {
      throw new ApiError(
        HTTP_STATUSES.BAD_REQUEST_400,
        "User already exists",
        "email or login",
      );
    }

    const hashedPassword = await this.hashService.hashPassword(userInput.password);

    const userDbModel = new UserDbModel(
      userInput.login,
      userInput.email,
      hashedPassword,
      new Date().toISOString(),
      true,
      randomUUID(),
      "",
      randomUUID(),
      "",
    );

    return this.usersRepository.createUser(userDbModel);
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return this.usersRepository.deleteUserById(userId);
  }
}
