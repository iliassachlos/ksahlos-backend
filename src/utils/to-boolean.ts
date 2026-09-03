/**
 *  Coerces a value to a boolean if possible
 *
 * @param value - The value to coerce
 * @returns Boolean value if coercion is possible, otherwise undefined
 */
export const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  return value === true || value === "true";
};
