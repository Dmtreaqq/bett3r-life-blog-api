import {usersRepository} from "./repositories/usersRepository";
import {UserApiRequestModel} from "./models/UserApiModel";
import {UserDbModel} from "./models/UserDbModel";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";

export const usersService = {
    async createUser(userInput: UserApiRequestModel): Promise<string> {
        const userByEmail = await usersRepository.getUserByEmail(userInput.email);
        const userByLogin = await usersRepository.getUserByLogin(userInput.login);

        if (userByEmail || userByLogin) {
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'User already exists', 'email or login');
        }

        const userDbModel: UserDbModel = {
            login: userInput.login,
            email: userInput.email,
            createdAt: new Date().toISOString(),
        }

        return usersRepository.createUser(userDbModel);
    },

    async deleteUserById(id: string): Promise<boolean> {
        return usersRepository.deleteUserById(id)
    }
}
