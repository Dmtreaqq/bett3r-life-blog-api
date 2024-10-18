import {Router, Response, NextFunction} from "express";
import {HTTP_STATUSES, RequestWbody, RequestWparams, RequestWquery} from "../../utils/types";
import {UserApiRequestModel, UserApiResponseModel, UsersApiResponseModel} from "./models/UserApiModel";
import {usersQueryRepository} from "./repositories/usersQueryRepository";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {usersService} from "./usersService";
import {UserQueryGetModel} from "./models/UserQueryGetModel";
import userUrlParamValidation from "./middlewares/userUrlParamValidation";

export const usersRouter = Router();

const usersController = {
    async createUser(req: RequestWbody<UserApiRequestModel>, res: Response<UserApiResponseModel>, next: NextFunction) {
        try {
            const userId = await usersService.createUser(req.body)
            const user = await usersQueryRepository.getUserById(userId)

            if (!user) {
                return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(user);
        } catch (err: any) {
            return next(err)
        }
    },

    async deleteUserById(req: RequestWparams<{ id: string }>, res: Response, next: NextFunction) {
        try {
            await usersService.deleteUserById(req.params.id)

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } catch (err: any) {
            return next(err)
        }
    },

    async getUsers(req: RequestWquery<UserQueryGetModel>, res: Response<UsersApiResponseModel>) {
        const { searchLoginTerm: login, searchEmailTerm: email, pageNumber, pageSize, sortBy, sortDirection } = req.query;

        const users = await usersQueryRepository.getUsers(
            login,
            email,
            Number(pageNumber) || 1,
            Number(pageSize) || 10,
            sortDirection,
            sortBy
        )

        return res.json(users)
    }
}

usersRouter.delete('/:id', authMiddleware, ...userUrlParamValidation, usersController.deleteUserById)
usersRouter.post('/', authMiddleware, usersController.createUser)
usersRouter.get('/', authMiddleware, usersController.getUsers)
