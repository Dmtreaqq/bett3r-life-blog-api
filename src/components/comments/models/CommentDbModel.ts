class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

class LikesInfo {
  likesCount!: number;
  dislikesCount!: number;
}

export class CommentDbModel {
  constructor(
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public postId: string,
    public likesInfo: LikesInfo,
  ) {}
}
