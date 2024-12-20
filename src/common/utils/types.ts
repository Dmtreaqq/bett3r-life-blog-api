/* eslint-disable */

import { Request } from "express";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

export enum HTTP_STATUSES {
  OK_200 = 200,
  CREATED_201 = 201,
  NO_CONTENT_204 = 204,
  BAD_REQUEST_400 = 400,
  NOT_AUTHORIZED_401 = 401,
  FORBIDDEN_403 = 403,
  NOT_FOUND_404 = 404,
  TOO_MANY_REQUESTS_429 = 429,
  INTERNAL_SERVER_ERROR_500 = 500,
}

export type FieldError = {
  message: string;
  field: string;
};

export type ApiErrorResult = {
  errorsMessages: FieldError[];
};

export type RequestWbody<T> = Request<{}, {}, T>;
export type RequestWquery<T> = Request<{}, {}, {}, T>;
export type RequestWparams<T> = Request<T>;
export type RequestWparamsAndBody<T, L> = Request<T, {}, L>;
export type RequestWparamsAndQuery<T, L> = Request<T, {}, {}, L>;
