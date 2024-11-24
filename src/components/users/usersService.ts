import { usersRepository } from "./repositories/usersRepository";
import { UserDbModel } from "./models/UserDbModel";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { usersQueryRepository } from "./repositories/usersQueryRepository";
import { hashService } from "../../common/services/hashService";
import { randomUUID } from "node:crypto";
import { UserApiRequestModel } from "./models/UserApiRequestModel";

class UsersService {
  async createUser(userInput: UserApiRequestModel): Promise<string> {
    const userByEmail = await usersRepository.getUserByEmail(userInput.email);
    const userByLogin = await usersRepository.getUserByLogin(userInput.login);

    if (userByEmail || userByLogin) {
      throw new ApiError(
        HTTP_STATUSES.BAD_REQUEST_400,
        "User already exists",
        "email or login",
      );
    }

    const hashedPassword = await hashService.hashPassword(userInput.password);

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

    return usersRepository.createUser(userDbModel);
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await usersQueryRepository.getUserById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return usersRepository.deleteUserById(userId);
  }
}

export const usersService = new UsersService();
