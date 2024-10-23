import {AuthLoginApiRequestModel, AuthRegisterApiRequestModel} from "./models/AuthApiModel";
import {usersRepository} from "../users/repositories/usersRepository";
import {ApiError} from "../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../common/utils/types";
import {hashService} from "../../common/services/hashService";
import {jwtAuthService} from "../../common/services/jwtService";
import {UserDbModel} from "../users/models/UserDbModel";
import {UserApiRequestModel} from "../users/models/UserApiModel";
import {usersService} from "../users/usersService";
import {emailService} from "../../common/services/emailService";

export const authService = {
    async login(authInput: AuthLoginApiRequestModel): Promise<string> {
        const userByLogin = await usersRepository.getUserByLogin(authInput.loginOrEmail)
        const userByEmail = await usersRepository.getUserByEmail(authInput.loginOrEmail)

        const user = userByEmail || userByLogin
        if (!user) {
            throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401)
        }

        const isValidPassword = await hashService.checkPassword(authInput.password, user.password)
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
    },

    async register(registerModel: AuthRegisterApiRequestModel): Promise<string> {
        // const userByEmail = await usersRepository.getUserByEmail(registerModel.email);
        // const userByLogin = await usersRepository.getUserByLogin(registerModel.login);
        //
        // if (userByEmail || userByLogin) {
        //     throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'User already exists', 'email or login');
        // }
        //
        // const hashedPassword = await hashService.hashPassword(registerModel.password)
        // if (!hashedPassword) {
        //     // TODO: Что тут делать? Бросать ли етот статус код просто или по другому обработать, как клиент поймет
        //     throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400)
        // }
        //
        // const userDbModel: UserDbModel = {
        //     login: registerModel.login,
        //     email: registerModel.email,
        //     password: hashedPassword,
        //     createdAt: new Date().toISOString()
        // }
        //
        // const userId = await usersRepository.createUser(userDbModel)


        // try {
        // TODO: dont use await
        //     await emailService.sendEmail("Message")
        // } catch (err) {
        //     console.log('Email sent error: ', err)
        // }

        return 'userId'
    }
}
