type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentApiRequestModel = {
  content: string;
};

export type CommentApiResponseModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
};

export type CommentsApiResponseModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentApiResponseModel[];
};
