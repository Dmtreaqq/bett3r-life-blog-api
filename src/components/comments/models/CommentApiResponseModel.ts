class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

class LikesInfo {
  likesCount!: number;
  dislikesCount!: number;
  myStatus!: string;
}

export class CommentApiResponseModel {
  id!: string;
  content!: string;
  commentatorInfo!: CommentatorInfo;
  createdAt!: string;
  likesInfo!: LikesInfo;
}
