type CommentatorInfo = {
    userId: string
    userLogin: string
}

export type CommentDbModel = {
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
}
