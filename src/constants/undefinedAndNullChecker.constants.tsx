export const undefinedAndNullChecker = (value: any) => {
  return value !== undefined && value !== null && value !== "";
};

export const isEmptyObject = (obj: any) => {
  if (!obj) return true;
  if (typeof obj === "object" && !Array.isArray(obj)) {
    return Object.keys(obj).length === 0;
  }
  return false;
};
