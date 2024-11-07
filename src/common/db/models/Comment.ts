import mongoose from "mongoose";
import { CommentDbModel } from "../../../components/comments/models/CommentDbModel";

const loginRegex = new RegExp("^[a-zA-Z0-9_-]*$");

const commentSchema = new mongoose.Schema<CommentDbModel>({
  postId: { type: String, required: true },
  content: { type: String, minlength: 20, maxlength: 300, required: true },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: {
      type: String,
      match: loginRegex,
      minlength: 3,
      maxlength: 10,
      required: true,
    },
  },
  createdAt: { type: String, required: true },
});

export const CommentClassModel = mongoose.model("comments", commentSchema);
