import type { Request, Response, NextFunction } from "express";
import status from "http-status";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(status.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(status.UNAUTHORIZED).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);

    next();
  } catch (error) {
    return res.status(status.UNAUTHORIZED).json({ error: "Unauthorized" });
  }
};
