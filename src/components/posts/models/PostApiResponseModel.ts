export class LikesDetails {
  addedAt!: string;
  userId!: string;
  login!: string;
}

export class ExtendedLikesInfo {
  likesCount!: number;
  dislikesCount!: number;
  myStatus!: string;
  newestLikes!: LikesDetails[];
}

export class PostApiResponseModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: ExtendedLikesInfo,
  ) {}
}
