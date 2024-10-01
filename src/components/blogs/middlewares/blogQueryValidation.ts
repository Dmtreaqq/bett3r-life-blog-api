import { query } from "express-validator";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";

const createQueryPaginationChain = () => query(['pageNumber', 'pageSize'])
    .optional()
    .isNumeric().withMessage('Can\'t be a string')
// .trim

const createQuerySortByChain = () => query('sortBy')
    .optional()
    .custom(value => {
        if (!isNaN(value)) {
            throw new Error('Should be a string');
        }
        return true;
    }).withMessage('Should be a string')

const createQuerySortDirectionChain = () => query('sortDirection')
    .optional()
    .isIn(['asc', 'desc']).withMessage('sortDirection must be either "asc" or "desc"')

export default [
    createQueryPaginationChain(),
    createQuerySortDirectionChain(),
    createQuerySortByChain(),
    validationMiddleware
]