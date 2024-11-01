import { HTTP_STATUSES } from "./types";

export class ApiError extends Error {
  public readonly httpCode: HTTP_STATUSES;
  public readonly field: string | undefined;

  constructor(httpCode: HTTP_STATUSES, message?: string, field: string = "No field") {
    super(message);

    // TODO WHY THIS ?
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.httpCode = httpCode;
    this.field = field;

    Error.captureStackTrace(this);
  }
}
