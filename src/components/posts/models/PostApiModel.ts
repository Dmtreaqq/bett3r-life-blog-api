import { PostDbModel } from "./PostDbModel";

export type PostApiResponseModel = {
  id: string;
} & PostDbModel;

export type PostsApiResponseModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostApiResponseModel[];
};

export type PostApiRequestModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
