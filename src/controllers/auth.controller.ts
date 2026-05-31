import { login } from "../services/auth.service.js";
import status from "http-status";
import type { Request, Response, NextFunction } from "express";

export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      const token = await login(username, password);

      return res.status(status.OK).json({ token });
    } catch (error) {
      next(error);
    }
  },
};
