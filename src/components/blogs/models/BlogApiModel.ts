import { PostApiRequestModel } from "../../posts/models/PostApiModel";

export type BlogCreatePostApiRequestModel = Omit<PostApiRequestModel, "blogId">;
