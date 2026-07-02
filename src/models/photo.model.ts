import { Document, model, Schema, Types } from "mongoose";

export interface IPhoto extends Document {
  title: string;
  description: string;
  number: number;
  url: string;
  collectionId: Types.ObjectId;
  visibility: boolean;
  cloudinaryId: string;
}

export const photoSchema = new Schema<IPhoto>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
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
