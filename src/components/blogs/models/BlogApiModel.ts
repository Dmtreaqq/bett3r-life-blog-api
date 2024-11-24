import { PostApiRequestModel } from "../../posts/models/PostApiRequestModel";

export type BlogCreatePostApiRequestModel = Omit<PostApiRequestModel, "blogId">;
