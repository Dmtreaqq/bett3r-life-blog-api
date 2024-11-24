import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {baseUrl, testCommentary} from "../constants";
import {postsTestManager} from "../posts/postsTestManager";
import {usersTestManager} from "../users/usersTestManager";
import {authTestManager} from "../auth/authTestManager";

import { UserApiRequestModel } from "../../../src/components/users/models/UserApiRequestModel";
import { CommentApiResponseModel } from "../../../src/components/comments/models/CommentApiResponseModel";

export const commentsTestManager = {
    async createComment(postId: string, token: string, comment?: string): Promise<CommentApiResponseModel> {
        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/${postId}${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: comment || testCommentary
            })

        return response.body
    },

    // async createComments(count: number): Promise<CommentApiResponseModel[]> {
    //     const comments: CommentApiResponseModel[] = []
    //
    //     for (let i = 0; i < count; i++) {
    //         await this.createComment(`${Math.floor(Math.random() * 5 + 1)}`)
    //     }
    //
    //     return comments
    // }
}