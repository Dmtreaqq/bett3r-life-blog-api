import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {fromUTF8ToBase64} from "../../../src/common/middlewares/basicAuthMiddleware";
import {runDB} from "../../../src/common/db/db";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {UsersRepository} from "../../../src/components/users/repositories/usersRepository";
import {UsersQueryRepository} from "../../../src/components/users/repositories/usersQueryRepository";
import {ObjectId} from "mongodb";
import mongoose from "mongoose";
import { UserApiRequestModel } from "../../../src/components/users/models/UserApiRequestModel";
import { UserApiResponseModel } from "../../../src/components/users/models/UserApiResponseModel";


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const userInput: UserApiRequestModel = {
    login: 'login6', password: "123456", email: "test-email@ukr.net"
}

const userDbModel: UserDbModel = {
    email: userInput.email,
    login: userInput.login,
    password: userInput.password,
    createdAt: new Date().toISOString(),
    isConfirmed: false,
    expirationDate: '1',
    recoveryCode: '',
    recoveryCodeExpirationDate: '',
    confirmationCode: 'a',
    commentReactions: []
}

const userEntity: UserApiResponseModel = {
    id: "",
    email: userInput.email,
    login: userInput.login,
    createdAt: ""
}

describe('/users Positive', () => {
    let usersRepository: UsersRepository;
    let usersQueryRepository: UsersQueryRepository;
    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);

        usersRepository = new UsersRepository()
        usersQueryRepository = new UsersQueryRepository()
    })

    afterAll(async () => {
        await mongoose.disconnect()

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should POST a user successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send(userInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...userEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })

        const userAfterDelete = await usersQueryRepository.getUserById(response.body.id);

        expect(userAfterDelete).toEqual({
            ...userEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('Should DELETE a user successfully', async () => {
        const userId = await usersRepository.createUser(userDbModel);

        await request
            .del(`${baseUrl}${CONFIG.PATH.USERS}/${userId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const userAfterDelete = await usersQueryRepository.getUserById(userId);

        expect(userAfterDelete).toEqual(null)
    })

    it('should GET users by searchEmailTerm successfully', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), email: 'another@test.com' } as any);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?searchEmailTerm=${userInput.email}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items.length).toEqual(1);
        expect(response1.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                ...userEntity,
                id: expect.any(String),
                createdAt: expect.any(String)
            })
        ]))

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?searchEmailTerm=${userInput.email.slice(3).toUpperCase()}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items.length).toEqual(1);
        expect(response2.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                ...userEntity,
                id: expect.any(String),
                createdAt: expect.any(String)
            })
        ]))
    })

    it('should GET users by searchLoginTerm successfully', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'another' } as any);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?searchLoginTerm=${userInput.login}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items.length).toEqual(1);
        expect(response1.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                ...userEntity,
                id: expect.any(String),
                createdAt: expect.any(String)
            })
        ]))

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?searchLoginTerm=${userInput.login.slice(3).toUpperCase()}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items.length).toEqual(1);
        expect(response2.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                ...userEntity,
                id: expect.any(String),
                createdAt: expect.any(String)
            })
        ]))
    })

    it('should GET users with pagination successfully', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?pageNumber=2&pageSize=2`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response1.body).toEqual({
            page: 2,
            pageSize: 2,
            totalCount: 4,
            pagesCount: 2,
            items: expect.any(Array)
        })
    })

    it('should GET users with sorting successfully', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'a1a' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'b2b' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'c3c' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'd4d' } as UserDbModel);

        // Default sortDir = desc
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?sortBy=login`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response1.body.items[0].login).toEqual('d4d')
        expect(response1.body.items[3].login).toEqual('a1a')
    })

    it('should GET users with sorting successfully', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'a1a' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'b2b' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'c3c' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'd4d' } as UserDbModel);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?sortBy=login&sortDirection=asc`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response1.body.items[0].login).toEqual('a1a')
        expect(response1.body.items[3].login).toEqual('d4d')
    })

    it('should GET users with all query parameters used', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), email: 'another@test.com' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'ahell1' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'bhell2' } as UserDbModel);
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId(), login: 'c3c' } as UserDbModel);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.USERS}/?sortBy=login&sortDirection=asc&searchEmailTerm=${userInput.email}&searchLoginTerm=hell`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response1.body.items.length).toEqual(3)
        expect(response1.body.items[0].login).toEqual('ahell1')
        expect(response1.body.items[1].login).toEqual('bhell2')
        expect(response1.body.items[2].login).toEqual('c3c')
    })
})
