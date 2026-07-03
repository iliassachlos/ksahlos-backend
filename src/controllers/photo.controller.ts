import type { Request, Response, NextFunction } from "express";
import {
  createPhoto,
  fetchPhotos,
  updatePhoto,
  deletePhoto,
  rearrangePhotos,
} from "../services/photo.service.js";
import status from "http-status";
import type {
  CreatePhotoRequest,
  UpdatePhotoRequest,
  PhotoQuery,
} from "../types/photo.types.js";

export const PhotoController = {
  getPhotos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as PhotoQuery;

      const photos = await fetchPhotos(query);
      return res.status(status.OK).json({ data: photos });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req.body as CreatePhotoRequest;
      const file = req.file;

      if (!file) {
        return res
          .status(status.BAD_REQUEST)
          .json({ error: "File is required" });
      }

      const newPhoto = await createPhoto(request, file.buffer);

      return res.status(status.CREATED).json({ data: newPhoto });
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = req.params.id as string;
      const request = req.body as UpdatePhotoRequest;
      const file = req.file;

      const updated = await updatePhoto(id, request, file?.buffer);

      return res.status(status.OK).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  rearrange: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { orderedIds } = req.body as { orderedIds: string[] };

      await rearrangePhotos(orderedIds);

      return res.status(status.OK).json({ message: "Photos rearranged" });
    } catch (error) {
      next(error);
    }
  },

  delete: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = req.params.id as string;

      await deletePhoto(id);

      return res.status(status.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
