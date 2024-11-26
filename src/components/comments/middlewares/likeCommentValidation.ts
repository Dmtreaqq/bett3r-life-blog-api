import { body } from "express-validator";
import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";

const createLikeStatusChain = () =>
  body("likeStatus")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty")
    .isIn(["None", "Like", "Dislike"])
    .withMessage("Needs to be None, Like, Dislike");

export default [createLikeStatusChain(), validationMiddleware];
