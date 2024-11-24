class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

export class CommentDbModel {
  constructor(
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public postId: string,
  ) {}
}
