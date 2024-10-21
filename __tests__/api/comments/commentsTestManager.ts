import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {baseUrl, testCommentary} from "../constants";
import {jwtAuthService} from "../../../src/common/services/jwtService";
import {blogsTestManager} from "../blogs/blogsTestManager";
import {postsTestManager} from "../posts/postsTestManager";
import {CommentApiResponseModel} from "../../../src/components/comments/models/CommentApiModel";

const token = jwtAuthService.createToken({login: 'userLogin', email: 'email', id: '123'})

export const commentsTestManager = {
    async createComment(comment?: string): Promise<CommentApiResponseModel> {
        const post = await postsTestManager.createPost()

        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/${post.id}${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: comment || testCommentary
            })

        return response.body
    },

    async createComments(count: number): Promise<CommentApiResponseModel[]> {
        const comments: CommentApiResponseModel[] = []

        for (let i = 0; i < count; i++) {
            await this.createComment(`${Math.floor(Math.random() * 5 + 1)}`)
        }

        return comments
    }
}