export class BlogApiResponseModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: string,
  ) {}
}
