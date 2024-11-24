import { CommentApiResponseModel } from "./CommentApiResponseModel";
import { Paginator } from "../../../common/models/base.models";

export class CommentsPaginatorApiResponseModel extends Paginator {
  items!: CommentApiResponseModel[];
}
