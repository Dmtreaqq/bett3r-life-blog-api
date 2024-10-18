import {usersRepository} from "./repositories/usersRepository";
import {UserApiRequestModel} from "./models/UserApiModel";
import {UserDbModel} from "./models/UserDbModel";

export const usersService = {
    async createUser(userInput: UserApiRequestModel): Promise<string> {
        const userByEmail = await usersRepository.getUserByEmail(userInput.email);
        const userByLogin = await usersRepository.getUserByLogin(userInput.login);

        if (userByEmail || userByLogin) {
            throw new Error('User already exists');
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
