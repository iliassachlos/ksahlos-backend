import type { Request, Response, NextFunction } from "express";
import status from "http-status";
import {
  fetchCollections,
  fetchCollectionBySlug,
  createCollection,
  updateCollection,
  setCollectionCover,
  rearrangeCollections,
  deleteCollection,
} from "../services/collection.service.js";
import type {
  CollectionQuery,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  SetCoverRequest,
  RearrangeRequest,
} from "../types/collection.types.js";

export const CollectionController = {
  getCollections: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as CollectionQuery;

      const collections = await fetchCollections(query);

      return res.status(status.OK).json({ data: collections });
    } catch (error) {
      next(error);
    }
  },

  getBySlug: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;

      const collection = await fetchCollectionBySlug(slug);

      return res.status(status.OK).json({ data: collection });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title } = req.body as CreateCollectionRequest;

      const collection = await createCollection(title);

      return res.status(status.CREATED).json({ data: collection });
    } catch (error) {
      next(error);
    }
  },

  rearrange: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderedIds } = req.body as RearrangeRequest;

      await rearrangeCollections(orderedIds);

      return res.status(status.OK).json({ message: "Collections rearranged" });
    } catch (error) {
      next(error);
    }
  },

  setCover: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { coverPhotoId } = req.body as SetCoverRequest;

      const collection = await setCollectionCover(id, coverPhotoId);

      return res.status(status.OK).json({ data: collection });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const payload = req.body as UpdateCollectionRequest;

      const collection = await updateCollection(id, payload);

      return res.status(status.OK).json({ data: collection });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await deleteCollection(id);

      return res.status(status.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
