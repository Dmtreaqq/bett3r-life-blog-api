import {BlogApiRequestModel} from "../../src/components/blogs/models/BlogApiModel";
import {fromUTF8ToBase64} from "../../src/common/middlewares/basicAuthMiddleware";
import {CONFIG} from "../../src/common/utils/config";
import {PostDbModel} from "../../src/components/posts/models/PostDbModel";
import {PostApiRequestModel} from "../../src/components/posts/models/PostApiModel";
import {UserApiRequestModel} from "../../src/components/users/models/UserApiModel";

export const baseUrl = '/api';
export const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;
// description: 'Some description' + Math.floor(Math.random() * 5 + 1),

export const blogApiRequestModel: BlogApiRequestModel = {
    name: 'BlogName',
    description: 'BlogDescription',
    websiteUrl: 'https://blog-website.com',
}

export const postApiRequestModel: PostApiRequestModel = {
    title: 'PostTitle',
    content: 'PostContent',
    shortDescription: 'PostShortDesc',
    blogId: 'blogId'
}

export const userApiRequestModel: UserApiRequestModel = {
    login: 'login',
    password: 'password',
    email: 'test-email@mail.com'
}

export const testCommentary = 'Test commentary that more than 20 symbols'