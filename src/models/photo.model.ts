import { Document, model, Schema } from "mongoose";

export interface IPhoto extends Document {
  title: string;
  description: string;
  number: number;
  url: string;
  category: string;
  visibility: boolean;
  cloudinaryId: string;
}

const photoSchema = new Schema<IPhoto>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    number: {
      type: Number,
      required: true,
    },

    visibility: {
      type: Boolean,
      required: true,
    },

    cloudinaryId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Photo = model<IPhoto>("Photo", photoSchema);
