import type { Request, Response, NextFunction } from "express";
import status from "http-status";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.message);
  return res
    .status(status.INTERNAL_SERVER_ERROR)
    .json({ error: err.message || "Something went wrong" });
};
