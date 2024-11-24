export class PostApiRequestModel {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}
