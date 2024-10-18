import {Router, Response} from "express";
import {HTTP_STATUSES, RequestWbody, RequestWparams, RequestWquery} from "../../utils/types";
import {UserApiRequestModel, UserApiResponseModel, UsersApiResponseModel} from "./models/UserApiModel";
import {usersQueryRepository} from "./repositories/usersQueryRepository";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {usersService} from "./usersService";
import {UserQueryGetModel} from "./models/UserQueryGetModel";
import userUrlParamValidation from "./middlewares/userUrlParamValidation";

export const usersRouter = Router();

const usersController = {
    async createUser(req: RequestWbody<UserApiRequestModel>, res: Response<UserApiResponseModel | object>) {
        try {
            // TODO: Should I return from service, or do a second call to DB ?
            const userId = await usersService.createUser(req.body)
            const user = await usersQueryRepository.getUserById(userId)

            if (!user) {
                return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(user);
        } catch (err: any) {
            if (err.message === 'User already exists') {
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                    errorsMessages: [
                        {
                            message: "User with such email or login already exists",
                            field: "email or login"
                        }
                    ]
                });
            }

            return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        }
    },

    async deleteUserById(req: RequestWparams<{ id: string }>, res: Response) {
        const user = await usersQueryRepository.getUserById(req.params.id)
        if (!user) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await usersService.deleteUserById(user.id)

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
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
