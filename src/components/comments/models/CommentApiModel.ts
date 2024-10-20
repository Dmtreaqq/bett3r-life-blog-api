type CommentatorInfo = {
    userId: string
    userLogin: string
}

export type CommentApiRequestModel = {
    content: string
}

export type CommentApiResponseModel = {
    id: string
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
}

