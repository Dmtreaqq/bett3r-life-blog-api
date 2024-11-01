import { usersRepository } from "./repositories/usersRepository";
import { UserApiRequestModel } from "./models/UserApiModel";
import { UserDbModel } from "./models/UserDbModel";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { usersQueryRepository } from "./repositories/usersQueryRepository";
import { hashService } from "../../common/services/hashService";
import { randomUUID } from "node:crypto";

export const usersService = {
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
    if (!hashedPassword) {
      // TODO: Что тут делать? Бросать ли етот статус код просто или по другому обработать, как клиент поймет
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400);
    }

    const userDbModel: UserDbModel = {
      login: userInput.login,
      email: userInput.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isConfirmed: true,
      confirmationCode: randomUUID(),
      expirationDate: "",
    };

    return usersRepository.createUser(userDbModel);
  },

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await usersQueryRepository.getUserById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return usersRepository.deleteUserById(userId);
  },
};
