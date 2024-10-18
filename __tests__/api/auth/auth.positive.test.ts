import {request} from "../test-helper";
import {CONFIG} from "../../../src/utils/config";
import {HTTP_STATUSES} from "../../../src/utils/types";
import {client, runDB, server} from "../../../src/db/db";

import {AuthLoginApiRequestModel} from "../../../src/components/auth/models/AuthApiModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {hashSync} from "bcrypt";

const baseUrl = '/api';

const authInput: AuthLoginApiRequestModel = {
    loginOrEmail: 'login',
    password: '12345'
}

const hashedPassword = hashSync(authInput.password, 10)
const userDbModel: UserDbModel = {
    email: 'some@test.net',
    login: authInput.loginOrEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
}

describe('/auth Positive', () => {
    beforeAll(async () => {
        await runDB()
    })

    afterAll(async () => {
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should POST login successfully', async () => {
        await usersRepository.createUser(userDbModel);

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send(authInput)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })
})
