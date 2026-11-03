import { createSlice } from "@reduxjs/toolkit";
import { reduxName } from "@/constants/redux.constants";

const preferencesSlice = createSlice({
  name: reduxName.preferences,
  initialState: {
    sideBarFormatPreference: 1,
  },
  reducers: {
    setSideBarFormatPreference: (state, action) => {
      state.sideBarFormatPreference = action.payload;
    },
  },
});

export const { setSideBarFormatPreference } = preferencesSlice.actions;
export default preferencesSlice.reducer;
