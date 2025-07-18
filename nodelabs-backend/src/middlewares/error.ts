import { NextFunction, Request, Response } from "express";
import { INodeLabsError } from "../common/errors";

const errorMiddleware = (
  err: Partial<INodeLabsError>,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.statusCode || 500;
  const errorMessage = `Internal server Error from ${err.message}`;
  console.error(err.stack);
  res.status(statusCode).json({ message: errorMessage });
};

export { errorMiddleware };
