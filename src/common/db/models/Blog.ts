import mongoose from "mongoose";
import { BlogDbModel } from "../../../components/blogs/models/BlogDbModel";

const blogSchema = new mongoose.Schema<BlogDbModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isMembership: { type: Boolean, required: true, default: false },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true, default: new Date().toISOString() },
});

export const BlogModelClass = mongoose.model("blogs", blogSchema);
