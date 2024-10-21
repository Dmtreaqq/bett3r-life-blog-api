import {PostApiRequestModel, PostApiResponseModel} from "../../../src/components/posts/models/PostApiModel";
import {authHeader, postApiRequestModel, baseUrl} from "../constants";
import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {blogsTestManager} from "../blogs/blogsTestManager";

export const postsTestManager = {
    async createPost(post: PostApiRequestModel = postApiRequestModel): Promise<PostApiResponseModel> {
        const blog = await blogsTestManager.createBlog()

        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...post, blogId: blog.id })
            .set('authorization', authHeader)

        return response.body
    }
}