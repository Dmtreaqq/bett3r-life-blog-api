import mongoose from "mongoose";
import { PostDbModel } from "../../../components/posts/models/PostDbModel";

const postSchema = new mongoose.Schema<PostDbModel>({
  title: { type: String, maxlength: 30, required: true },
  shortDescription: { type: String, maxlength: 100, required: true },
  content: { type: String, maxlength: 1000, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, maxlength: 15, required: true },
  createdAt: { type: String, required: true },
  likesInfo: {
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
  },
  likesDetails: [
    {
      _id: 0,
      addedAt: { type: String, required: true },
      userId: { type: String, required: true },
      login: { type: String, required: true },
    },
  ],
});

export const PostModelClass = mongoose.model("posts", postSchema);
