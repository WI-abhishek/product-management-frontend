import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import { reduxName } from "@/constants/redux.constants";
import authReducer from "@/redux/auth.slice";
import sideBarReducer from "@/redux/sidebar.slice";
import preferencesReducer from "@/redux/preferences.slice";

// Custom localStorage adapter for redux-persist (ESM/Vite compatible)
const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

// Each persisted slice gets its own unique key
const authPersistConfig = {
  key: reduxName.auth,
  storage,
};

// Combine reducers — auth is persisted
const rootReducer = combineReducers({
  [reduxName.auth]: persistReducer(authPersistConfig, authReducer),
  [reduxName.sideBar]: sideBarReducer,
  [reduxName.preferences]: preferencesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
