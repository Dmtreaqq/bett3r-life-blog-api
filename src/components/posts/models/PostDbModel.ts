// export type PostDbModel = {
//   title: string;
//   shortDescription: string;
//   content: string;
//   blogId: string;
//   blogName: string;
//   createdAt: string;
// };

export class PostDbModel {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}
