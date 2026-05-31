import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: "Something went wrong" });
};
