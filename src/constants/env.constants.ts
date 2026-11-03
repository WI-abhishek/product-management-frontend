export const ENV = import.meta.env.VITE_ENV as string;

export const isDev = ENV === "dev";
