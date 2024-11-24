class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

export class CommentApiResponseModel {
  id!: string;
  content!: string;
  commentatorInfo!: CommentatorInfo;
  createdAt!: string;
}