import { localStorageName } from "../constants";

export const getStoredMenus = () => {
  try {
    return JSON.parse(localStorage.getItem(localStorageName.lmMenus) || "{}");
  } catch {
    return {};
  }
};

export const setStoredMenus = (
  data: Partial<{
    applicationMenuId: number;
    subApplicationMenuId: number;
  }>,
) => {
  const existing = getStoredMenus();

  localStorage.setItem(
    localStorageName.lmMenus,
    JSON.stringify({
      ...existing,
      ...data,
    }),
  );
};
