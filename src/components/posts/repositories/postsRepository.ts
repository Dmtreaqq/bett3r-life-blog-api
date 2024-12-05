import { PostDbModel } from "../models/PostDbModel";
import { ObjectId } from "mongodb";
import { PostModelClass } from "../../../common/db/models/Post";
import { PostApiResponseModel } from "../models/PostApiResponseModel";
import { ReactionEnum } from "../../users/models/UserDbModel";
import { injectable } from "inversify";

@injectable()
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
      likesInfo: post.likesInfo,
      likesDetails: post.likesDetails,
    };
  }

  async updateLikesOnPostById(
    postId: string,
    likes: number,
    op: ReactionEnum,
    userId: string,
    login: string,
  ) {
    const num = op === ReactionEnum.Like ? 1 : -1;

    const result = await PostModelClass.updateOne(
      {
        _id: new ObjectId(postId),
      },
      {
        "likesInfo.likesCount": likes + num,
        ...(op === ReactionEnum.Like
          ? {
              $push: {
                likesDetails: {
                  userId,
                  login,
                  addedAt: new Date().toISOString(),
                },
              },
            }
          : {
              $pull: {
                likesDetails: {
                  userId,
                },
              },
            }),
      },
    );

    return result.modifiedCount === 1;
  }

  async updateDislikesOnPostById(postId: string, dislikes: number, op: ReactionEnum) {
    const num = op === ReactionEnum.Dislike ? 1 : -1;

    const result = await PostModelClass.updateOne(
      {
        _id: new ObjectId(postId),
      },
      {
        "likesInfo.dislikesCount": dislikes + num,
      },
    );

    return result.modifiedCount === 1;
  }
}
