export class BlogCreatePostApiRequestModel {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}
