import { Document, model, Schema, Types } from "mongoose";

export interface ICollection extends Document {
  title: string;
  slug: string;
  coverPhotoId?: Types.ObjectId | null;
  order: number;
  visibility: boolean;
}

export const collectionSchema = new Schema<ICollection>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    coverPhotoId: {
      type: Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },

    order: {
      type: Number,
      default: 0,
    },

    visibility: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Collection = model<ICollection>("Collection", collectionSchema);
