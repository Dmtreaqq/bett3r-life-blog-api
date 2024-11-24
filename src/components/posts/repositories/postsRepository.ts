import { PostDbModel } from "../models/PostDbModel";
import { ObjectId } from "mongodb";
import { PostModelClass } from "../../../common/db/models/Post";
import { PostApiResponseModel } from "../models/PostApiResponseModel";

export class PostsRepository {
  async createPost(postInput: PostDbModel): Promise<string> {
    const result = await PostModelClass.create(postInput);

    return result._id.toString();
  }

  async updatePostById(postResponseModel: PostApiResponseModel): Promise<boolean> {
    await PostModelClass.updateOne(
      {
        _id: new ObjectId(postResponseModel.id),
      },
      {
        $set: {
          title: postResponseModel.title,
          shortDescription: postResponseModel.shortDescription,
          content: postResponseModel.content,
          blogId: postResponseModel.blogId,
          blogName: postResponseModel.blogName,
          createdAt: postResponseModel.createdAt,
        },
      },
    );

    return true;
  }

  async deletePostById(id: string): Promise<boolean> {
    await PostModelClass.deleteOne({ _id: new ObjectId(id) });

    return true;
  }

  async deleteAllPosts(): Promise<void> {
    await PostModelClass.deleteMany({});
  }

  async getPostById(id: string): Promise<PostDbModel | null> {
    const post = await PostModelClass.findOne({ _id: new ObjectId(id) });

    if (!post) return null;

    return {
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    };
  }
}
