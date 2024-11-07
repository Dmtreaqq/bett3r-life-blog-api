import mongoose from "mongoose";
import { PostDbModel } from "../../../components/posts/models/PostDbModel";

const postSchema = new mongoose.Schema<PostDbModel>({
  title: { type: String, maxlength: 30, required: true },
  shortDescription: { type: String, maxlength: 100, required: true },
  content: { type: String, maxlength: 1000, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, maxlength: 15, required: true },
  createdAt: { type: String, required: true },
});

export const PostModelClass = mongoose.model("posts", postSchema);
