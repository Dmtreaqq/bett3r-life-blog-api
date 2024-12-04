export enum ReactionEnum {
  Like = "Like",
  Dislike = "Dislike",
}

export class CommentReaction {
  commentId!: string;
  status!: ReactionEnum;
}

export class PostReaction {
  postId!: string;
  status!: ReactionEnum;
}

export class UserDbModel {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt: string,
    public isConfirmed: boolean,
    public confirmationCode: string,
    public recoveryCode: string,
    public recoveryCodeExpirationDate: string,
    public expirationDate: string,
    public commentReactions: CommentReaction[],
    public postReactions: PostReaction[],
  ) {}
}
