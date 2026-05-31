import { model, Schema, type Document } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
}

export const adminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
});

export const Admin = model<IAdmin>("Admin", adminSchema);
