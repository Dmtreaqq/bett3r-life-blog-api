class LikesInfo {
  likesCount!: number;
  dislikesCount!: number;
}

class LikesDetails {
  addedAt!: string;
  userId!: string;
  login!: string;
}

export class PostDbModel {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public likesInfo: LikesInfo,
    public likesDetails: LikesDetails[],
  ) {}
}
