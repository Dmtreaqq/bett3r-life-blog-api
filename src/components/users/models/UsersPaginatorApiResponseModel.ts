import { UserApiResponseModel } from "./UserApiResponseModel";
import { Paginator } from "../../../common/models/base.models";

export class UsersPaginatorApiResponseModel extends Paginator {
  items!: UserApiResponseModel[];
}
