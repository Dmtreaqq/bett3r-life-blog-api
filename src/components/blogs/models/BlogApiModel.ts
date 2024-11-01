import { PostApiRequestModel } from "../../posts/models/PostApiModel";

export type BlogApiRequestModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogApiResponseModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
};

export type BlogsApiResponseModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogApiResponseModel[];
};

export type BlogCreatePostApiRequestModel = Omit<PostApiRequestModel, "blogId">;
