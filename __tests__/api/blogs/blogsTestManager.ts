import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {authHeader, baseUrl, blogApiRequestModel} from "../constants";
import {BlogApiRequestModel, BlogApiResponseModel} from "../../../src/components/blogs/models/BlogApiModel";

export const blogsTestManager = {
    async createBlog(blog: BlogApiRequestModel = blogApiRequestModel): Promise<BlogApiResponseModel> {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .set('authorization', authHeader)
            .send(blog)

        return response.body
    },

    async createBlogs(blogsCount: number) {
        const blogs: BlogApiResponseModel[] = [];
        const rand = Math.floor(Math.random() * 5)

        for (let i = 0; i < blogsCount; i++) {
            await this.createBlog({
                ...blogApiRequestModel,
                name: `Doctor ${String.fromCharCode(65 + rand + i)}test`
            })
        }

        return blogs
    }
}