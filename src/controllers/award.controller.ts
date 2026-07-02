import type { Request, Response, NextFunction } from "express";
import { fetchAwards, createAward, deleteAward, rearrangeAwards } from "../services/award.service.js";
import status from "http-status";

export const AwardController = {
  getAwards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const awards = await fetchAwards();
      return res.status(status.OK).json({ data: awards });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(status.BAD_REQUEST).json({ error: "File is required" });
      }

      const newAward = await createAward(file.buffer);

      return res.status(status.CREATED).json({ data: newAward });
    } catch (error) {
      next(error);
    }
  },

  rearrange: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderedIds } = req.body as { orderedIds: string[] };

      await rearrangeAwards(orderedIds);

      return res.status(status.OK).json({ message: "Awards rearranged" });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await deleteAward(id);

      return res.status(status.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
