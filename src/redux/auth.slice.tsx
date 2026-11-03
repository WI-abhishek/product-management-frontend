import { createSlice } from "@reduxjs/toolkit";
import { reduxName } from "@/constants/redux.constants";
import { secureStorage } from "@/utils";

const authSlice = createSlice({
  name: reduxName.auth,
  initialState: {
    user: {} as any,
    token: null as string | null,
  },
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      const refreshToken = user?.refreshToken;
      secureStorage.set("user", JSON.stringify(user));
      secureStorage.set("token", token);
      if (refreshToken) {
        secureStorage.set("refreshToken", refreshToken);
      }
    },

    logout: (state) => {
      state.token = null;
      state.user = {};

      secureStorage.remove("user");
      secureStorage.remove("token");
      secureStorage.remove("refreshToken");
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };

      secureStorage.set("user", JSON.stringify(state.user));
    },

    setAccessToken: (state, action) => {
      if (typeof action.payload === "string") {
        state.token = action.payload;
        secureStorage.set("token", action.payload);
      } else if (action.payload) {
        const token = action.payload.token || action.payload.accessToken;
        const refreshToken = action.payload.refreshToken;
        if (token) {
          state.token = token;
          secureStorage.set("token", token);
        }
        if (refreshToken) {
          secureStorage.set("refreshToken", refreshToken);
          if (state.user) {
            state.user = {
              ...state.user,
              refreshToken,
            };
            secureStorage.set("user", JSON.stringify(state.user));
          }
        }
      }
    },

    setTokens: (state, action) => {
      const token = action.payload.token || action.payload.accessToken;
      const refreshToken = action.payload.refreshToken;
      if (token) {
        state.token = token;
        secureStorage.set("token", token);
      }
      if (refreshToken) {
        secureStorage.set("refreshToken", refreshToken);
        if (state.user) {
          state.user = {
            ...state.user,
            refreshToken,
          };
          secureStorage.set("user", JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { login, logout, updateUser, setAccessToken, setTokens } = authSlice.actions;
export default authSlice.reducer;
