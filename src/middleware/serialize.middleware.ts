import type { Request, Response, NextFunction } from "express";

// Add legacy _id fields to all objects that have an id field
const addLegacyIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(addLegacyIds);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  // Dates and other non-plain objects must pass through untouched.
  if (value instanceof Date) {
    return value;
  }

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(source)) {
    result[key] = addLegacyIds(item);
  }

  if (typeof source.id === "string" && result._id === undefined) {
    result._id = source.id;
  }

  return result;
};

export const legacyIdSerializer = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalJson = res.json.bind(res);

  res.json = (body: unknown) => originalJson(addLegacyIds(body));

  next();
};
