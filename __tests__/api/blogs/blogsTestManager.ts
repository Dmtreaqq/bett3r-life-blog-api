import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {authHeader, baseUrl, blogApiRequestModel} from "../constants";
import { BlogApiResponseModel } from "../../../src/components/blogs/models/BlogApiResponseModel";
import { BlogApiRequestModel } from "../../../src/components/blogs/models/BlogApiRequestModel";

export const blogsTestManager = {
    async createBlog(blogInput?: BlogApiRequestModel): Promise<BlogApiResponseModel> {
        const blog = blogInput || blogApiRequestModel

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
            const blog = await this.createBlog({
                ...blogApiRequestModel,
                name: `Doctor ${String.fromCharCode(65 + rand + i)}test`
            })

            blogs.push(blog)
        }

        return blogs.sort()
    }
}