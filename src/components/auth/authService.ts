import {AuthLoginApiRequestModel} from "./models/AuthApiModel";
import {usersRepository} from "../users/repositories/usersRepository";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";
import {hashService} from "../../services/hashService";

export const authService = {
    async login(authInput: AuthLoginApiRequestModel): Promise<boolean> {
        const userByLogin = await usersRepository.getUserByLogin(authInput.loginOrEmail)
        const userByEmail = await usersRepository.getUserByEmail(authInput.loginOrEmail)

        const user = userByEmail || userByLogin

        if (!user) {
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'No user with such email or login', 'loginOrEmail')
        }

        return hashService.checkPassword(authInput.password, user.password)
    }
}
