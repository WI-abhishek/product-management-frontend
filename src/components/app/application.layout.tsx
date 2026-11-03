import { Fragment } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { reduxName } from "@/constants";
import {
  setMainSideBarToggler,
  setPrimeSideBarToggler,
  setSingleSideBarToggler,
} from "@/redux/sidebar.slice";
import { HeaderComponent } from "@/components/app/layout/header/header.component";
import SideNavComponent from "@/components/app/layout/side-nav/side-nav.component";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function ApplicationLayout() {
  const { primeSideBarToggler, subMenus, singleSideBarToggler } = useSelector(
    (state: any) => state[reduxName?.sideBar],
  );
  const { sideBarFormatPreference } = useSelector((state: any) => state[reduxName.preferences]);
  const { isBelow768px, isBelow1200px } = useBreakpoint();

  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <Fragment>
      <div className="">
        <HeaderComponent />
        <div
          className={`main-content ${sideBarFormatPreference === 2 ? "format-2" : "format-1"} ${singleSideBarToggler ? "is-main-content-partial-1" : ""} ${!subMenus?.haveChilds || primeSideBarToggler ? "is-main-content-partial-2" : ""}`}
        >
          <div className={`main-content-body srcoll-visible-only-vertical`}>
            <div key={location.pathname} className="page-transition">
              <Outlet />
            </div>
          </div>
        </div>
        <SideNavComponent />
      </div>
      <div
        onClick={() => {
          dispatch(setSingleSideBarToggler(false));
          dispatch(setMainSideBarToggler(false));
          dispatch(setPrimeSideBarToggler(false));
        }}
        className={`${((isBelow768px && primeSideBarToggler) || (isBelow1200px && singleSideBarToggler)) && "drawer-overlay"}`}
      ></div>
    </Fragment>
  );
}
