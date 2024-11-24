export class BlogDbModel {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: string,
  ) {}
}
