import { Paginator } from "../../../common/models/base.models";
import { BlogApiResponseModel } from "./BlogApiResponseModel";

export class BlogsPaginatorApiResponseModel extends Paginator {
  items!: BlogApiResponseModel[];
}
