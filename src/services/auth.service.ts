import bcrypt from "bcryptjs";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";

export const login = async (
  username: string,
  password: string,
): Promise<string> => {
  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new AppError("Invalid username or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return token;
};
