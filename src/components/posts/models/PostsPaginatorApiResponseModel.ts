import { PostApiResponseModel } from "./PostApiResponseModel";
import { Paginator } from "../../../common/models/base.models";

export class PostsPaginatorApiResponseModel extends Paginator {
  items!: PostApiResponseModel[];
}
