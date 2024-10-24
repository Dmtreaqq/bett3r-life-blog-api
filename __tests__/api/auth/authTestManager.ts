import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {baseUrl} from "../constants";
import {usersTestManager} from "../users/usersTestManager";
import {UserApiRequestModel} from "../../../src/components/users/models/UserApiModel";


export const authTestManager = {
    async loginByEmail(email: string, password: string): Promise<any> {
        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({
                loginOrEmail: email,
                password: password
            })

        return response.body
    },

    async getTokenOfLoggedInUser(inputLogin = 'userLogin', inputEmail = 'test@test.com'): Promise<string> {
        const user = {
            login: inputLogin,
            email: inputEmail,
            password: '123456'
        }

        await usersTestManager.createUser(user);

        const { accessToken } = await authTestManager.loginByEmail(user.email, user.password)

        return accessToken
    }
}