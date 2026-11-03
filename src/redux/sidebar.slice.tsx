import { createSlice } from "@reduxjs/toolkit";
import { reduxName } from "@/constants/redux.constants";
import { getStoredMenus, setStoredMenus } from "@/utils";
import { adminMenusStatic } from "@/components/app/layout/side-nav/static-menus/admin-static-menus";

const initialMenus = getStoredMenus();

const sideBarSlice = createSlice({
  name: reduxName.sideBar,
  initialState: {
    applicationMenuId: initialMenus.applicationMenuId ?? 1,
    subApplicationMenuId: initialMenus.subApplicationMenuId ?? 0,
    mainSideBarToggler: false,
    primeSideBarToggler: false,
    singleSideBarToggler: false,
    subMenus: {
      haveChilds: true,
    },
    menus: adminMenusStatic,
  },
  reducers: {
    setMenusByRole: (state) => {
      state.menus = adminMenusStatic;
    },

    updateMenuChilds: (state, action) => {
      const { applicationMenuId, childs } = action.payload;
      state.menus = (state.menus as any[]).map((menu: any) =>
        menu.applicationMenuId === applicationMenuId ? { ...menu, childs } : menu,
      );
      if ((state.subMenus as any)?.applicationMenuId === applicationMenuId) {
        state.subMenus = { ...(state.subMenus as any), childs };
      }
    },

    setSideBarMenus: (state, action) => {
      state.applicationMenuId = action.payload.applicationMenuId;
      state.subApplicationMenuId = action.payload.subApplicationMenuId;

      setStoredMenus({
        applicationMenuId: state.applicationMenuId,
        subApplicationMenuId: state.subApplicationMenuId,
      });
    },

    setSideBarApplicationMenu: (state, action) => {
      state.applicationMenuId = action.payload.applicationMenuId;
      setStoredMenus({
        applicationMenuId: state.applicationMenuId,
        subApplicationMenuId: state.subApplicationMenuId,
      });
    },

    setSideBarSubApplicationMenu: (state, action) => {
      state.subApplicationMenuId = action.payload.subApplicationMenuId;
      setStoredMenus({
        subApplicationMenuId: state.subApplicationMenuId,
      });
    },

    setMainSideBarToggler: (state, action) => {
      state.mainSideBarToggler = action.payload;
    },

    setPrimeSideBarToggler: (state, action) => {
      state.primeSideBarToggler = action.payload;
    },

    setSubMenus: (state, action) => {
      state.subMenus = action.payload;
    },

    setSingleSideBarToggler: (state, action) => {
      state.singleSideBarToggler = action.payload;
    },
  },
});

export const {
  setSideBarMenus,
  setSideBarApplicationMenu,
  setSideBarSubApplicationMenu,
  setMainSideBarToggler,
  setPrimeSideBarToggler,
  setSubMenus,
  setSingleSideBarToggler,
  updateMenuChilds,
  setMenusByRole,
} = sideBarSlice.actions;
export default sideBarSlice.reducer;
