import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {authHeader, baseUrl, userApiRequestModel} from "../constants";
import { UserApiRequestModel } from "../../../src/components/users/models/UserApiRequestModel";
import { UserApiResponseModel } from "../../../src/components/users/models/UserApiResponseModel";

export const usersTestManager = {
    async createUser(userApiRequest?: UserApiRequestModel): Promise<UserApiResponseModel> {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send(userApiRequest || userApiRequestModel)
            .set('authorization', authHeader)

        return response.body
    }
}