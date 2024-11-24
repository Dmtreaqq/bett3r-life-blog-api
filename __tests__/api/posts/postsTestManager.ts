import {authHeader, postApiRequestModel, baseUrl} from "../constants";
import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import { PostApiResponseModel } from "../../../src/components/posts/models/PostApiResponseModel";
import { PostApiRequestModel } from "../../../src/components/posts/models/PostApiRequestModel";

export const postsTestManager = {
    async createPost(blogId: string, postInput?: PostApiRequestModel): Promise<PostApiResponseModel> {
        const post = postInput || postApiRequestModel

        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...post, blogId })
            .set('authorization', authHeader)

        return response.body
    }
}