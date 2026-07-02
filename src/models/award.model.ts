import { Document, model, Schema } from "mongoose";

export interface IAward extends Document {
  url: string;
  cloudinaryId: string;
  order: number;
}

export const awardSchema = new Schema<IAward>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    cloudinaryId: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Award = model<IAward>("Award", awardSchema);
