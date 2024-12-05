import { Router, Response, NextFunction } from "express";
import {
  HTTP_STATUSES,
  RequestWbody,
  RequestWparams,
  RequestWquery,
} from "../../common/utils/types";
import { UsersQueryRepository } from "./repositories/usersQueryRepository";
import { authMiddleware } from "../../common/middlewares/basicAuthMiddleware";
import { UsersService } from "./usersService";
import { UserQueryGetModel } from "./models/UserQueryGetModel";
import userUrlParamValidation from "./middlewares/userUrlParamValidation";
import userValidation from "./middlewares/userValidation";
import { UserApiRequestModel } from "./models/UserApiRequestModel";
import { UserApiResponseModel } from "./models/UserApiResponseModel";
import { UsersPaginatorApiResponseModel } from "./models/UsersPaginatorApiResponseModel";
import { injectable } from "inversify";
import { container } from "../../composition-root";

export const usersRouter = Router();

@injectable()
class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    req: RequestWbody<UserApiRequestModel>,
    res: Response<UserApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const userId = await this.usersService.createUser(req.body);
      const user = await this.usersQueryRepository.getUserById(userId);

      if (!user) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.status(HTTP_STATUSES.CREATED_201).json(user);
    } catch (err: unknown) {
      return next(err);
    }
  }

  async deleteUserById(
    req: RequestWparams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.usersService.deleteUserById(req.params.id);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err: unknown) {
      return next(err);
    }
  }

  async getUsers(
    req: RequestWquery<UserQueryGetModel>,
    res: Response<UsersPaginatorApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const {
        searchLoginTerm: login,
        searchEmailTerm: email,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      } = req.query;

      const users = await this.usersQueryRepository.getUsers(
        login,
        email,
        Number(pageNumber) || 1,
        Number(pageSize) || 10,
        sortDirection,
        sortBy,
      );

      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }
}

const usersController = container.resolve(UsersController);

usersRouter.delete(
  "/:id",
  authMiddleware,
  ...userUrlParamValidation,
  usersController.deleteUserById.bind(usersController),
);
usersRouter.post(
  "/",
  authMiddleware,
  ...userValidation,
  usersController.createUser.bind(usersController),
);
usersRouter.get("/", authMiddleware, usersController.getUsers.bind(usersController));
