import {AuthLoginApiRequestModel} from "./models/AuthApiModel";
import {usersRepository} from "../users/repositories/usersRepository";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";
import {hashService} from "../../services/hashService";
import {jwtAuthService} from "../../services/jwtService";

export const authService = {
    async login(authInput: AuthLoginApiRequestModel): Promise<string> {
        const userByLogin = await usersRepository.getUserByLogin(authInput.loginOrEmail)
        const userByEmail = await usersRepository.getUserByEmail(authInput.loginOrEmail)

        const user = userByEmail || userByLogin

        if (!user) {
            throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401)
        }

        const isValidPassword = hashService.checkPassword(authInput.password, user.password)

        if (!isValidPassword) {
            throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401)
        }

        const token = jwtAuthService.createToken({
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        })

        return token
    }
}
