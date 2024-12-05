import { UserDbModel } from "../models/UserDbModel";
import { ObjectId } from "mongodb";
import { add } from "date-fns/add";
import { randomUUID } from "node:crypto";
import { UserModelClass } from "../../../common/db/models/User";
import { injectable } from "inversify";

@injectable()
export class UsersRepository {
  async getUserById(userId: string) {
    return await UserModelClass.findOne({ _id: new ObjectId(userId) });
  }

  async getUserByConfirmationCode(confirmCode: string) {
    return await UserModelClass.findOne({ confirmationCode: confirmCode });
  }

  async getUserByRecoveryCode(recoveryCode: string) {
    return await UserModelClass.findOne({ recoveryCode });
  }

  async updateConfirmation(userId: string): Promise<boolean> {
    const result = await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isConfirmed: true } },
    );

    return result.modifiedCount === 1;
  }

  async updateCodeForEmail(userId: string): Promise<string> {
    const newCode = randomUUID();
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          expirationDate: add(new Date(), { minutes: 5 }).toISOString(),
          confirmationCode: newCode,
        },
      },
    );

    return newCode;
  }

  async updateCodeForPassword(userId: string): Promise<string> {
    const newCode = randomUUID();
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          recoveryCodeExpirationDate: add(new Date(), { minutes: 5 }).toISOString(),
          recoveryCode: newCode,
        },
      },
    );

    return newCode;
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );
  }

  async createUser(user: UserDbModel): Promise<string> {
    const { _id } = await UserModelClass.create(user);

    return _id.toString();
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await UserModelClass.deleteOne({
      _id: new ObjectId(userId),
    });

    return result.deletedCount === 1;
  }

  async deleteAllUsers() {
    await UserModelClass.deleteMany({});
  }

  async getUserByEmail(email: string) {
    return UserModelClass.findOne({ email });
  }

  async getUserByLogin(login: string) {
    return UserModelClass.findOne({ login });
  }

  async createLikesInfo(userId: string, commentId: string, status: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          commentReactions: { commentId, status },
        },
      },
    );
  }

  async createPostLikesInfo(userId: string, postId: string, status: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          postReactions: { postId, status },
        },
      },
    );
  }

  async updateLikesInfo(userId: string, commentId: string, status: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId), "commentReactions.commentId": commentId },
      {
        $set: {
          "commentReactions.$.status": status,
        },
      },
    );
  }

  async updatePostLikesInfo(userId: string, postId: string, status: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId), "postReactions.postId": postId },
      {
        $set: {
          "postReactions.$.status": status,
        },
      },
    );
  }

  async deleteCommentReaction(userId: string, commentId: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          commentReactions: { commentId },
        },
      },
    );
  }

  async deletePostReaction(userId: string, postId: string) {
    await UserModelClass.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          postReactions: { postId },
        },
      },
    );
  }
}
