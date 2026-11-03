import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { commonUtils, reduxName, Paths } from "@/constants";
import { navigationIcons } from "@/components/app/layout/side-nav/static-menus/navigation-icons";
import { setSideBarMenus, setSingleSideBarToggler } from "@/redux/sidebar.slice";
import { FaAngleLeft, FaChevronDown } from "react-icons/fa6";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export function SingleSidePanel() {
  const location = useLocation();
  const {
    singleSideBarToggler,
    applicationMenuId,
    menus: sideBarMenus,
  } = useSelector((state: any) => state[reduxName.sideBar]);
  const { user } = useSelector((state: any) => state[reduxName.auth]);
  const { isBelow1200px } = useBreakpoint();
  const dispatch = useDispatch();

  const isMenuAllowed = (menu: any): boolean => {
    if (!isBelow1200px) {
      return true;
    }
    return !menu?.isNotResponsive;
  };

  const [openAccordion, setOpenAccordion] = useState<number | null>(() => {
    const active = sideBarMenus?.find((m: any) => m.applicationMenuId === applicationMenuId);
    return active?.haveChilds ? active.applicationMenuId : null;
  });

  const checkIsItemActive = (menu: any, isActive: boolean) => {
    if (menu.haveChilds) {
      return Boolean(
        menu.childs?.some((child: any) => location.pathname.startsWith(menu.path + child.path)) ||
        menu?.applicationMenuId === applicationMenuId,
      );
    }
    return isActive;
  };

  const handleParentClick = (menu: any) => {
    if (menu.haveChilds) {
      setOpenAccordion((prev) => (prev === menu.applicationMenuId ? null : menu.applicationMenuId));
    } else {
      setOpenAccordion(null);
      dispatch(
        setSideBarMenus({ applicationMenuId: menu.applicationMenuId, subApplicationMenuId: 0 }),
      );
      if (isBelow1200px) {
        dispatch(setSingleSideBarToggler(false));
      }
    }
  };

  const handleChildClick = (parent: any, child: any) => {
    dispatch(
      setSideBarMenus({
        applicationMenuId: parent.applicationMenuId,
        subApplicationMenuId: child.subApplicationMenuId,
      }),
    );
    if (isBelow1200px) {
      dispatch(setSingleSideBarToggler(false));
    }
  };

  // Automatically sync Redux applicationMenuId with current URL path
  useEffect(() => {
    if (!sideBarMenus?.length) return;

    for (const menu of sideBarMenus) {
      if (menu.haveChilds && menu.childs?.length) {
        const matchedChild = menu.childs.find((child: any) =>
          location.pathname.startsWith(menu.path + child.path),
        );
        if (matchedChild) {
          if (
            applicationMenuId !== menu.applicationMenuId ||
            openAccordion !== menu.applicationMenuId
          ) {
            dispatch(
              setSideBarMenus({
                applicationMenuId: menu.applicationMenuId,
                subApplicationMenuId: matchedChild.subApplicationMenuId,
              }),
            );
            setOpenAccordion(menu.applicationMenuId);
          }
          return;
        }
      } else if (
        menu.path &&
        (location.pathname === menu.path || location.pathname.startsWith(`${menu.path}/`))
      ) {
        if (applicationMenuId !== menu.applicationMenuId) {
          dispatch(
            setSideBarMenus({
              applicationMenuId: menu.applicationMenuId,
              subApplicationMenuId: 0,
            }),
          );
        }
        return;
      }
    }
  }, [location.pathname, sideBarMenus, dispatch, applicationMenuId, openAccordion]);

  useEffect(() => {
    const active = sideBarMenus?.find((m: any) => m.applicationMenuId === applicationMenuId);
    if (active?.haveChilds) {
      setOpenAccordion(active.applicationMenuId);
    }
  }, [applicationMenuId, sideBarMenus]);

  return (
    <div
      className={`single-side-panel ${!isBelow1200px && singleSideBarToggler ? "is-single-sidebar-close" : ""} ${isBelow1200px && singleSideBarToggler ? "is-single-sidebar-open" : ""}`}
    >
      <div className="single-side-panel-body">
        <div className="single-side-panel-header">
          <NavLink
            to={`/${Paths.admin}/${Paths.dashboard}`}
            className="flex items-center justify-center gap-3 no-underline select-none -ml-[10px]"
          >
            <img
              src={commonUtils.mainLogoImage}
              className="h-9 w-auto object-contain block shrink-0"
              alt="LogixFlow"
            />
            <span className="text-2xl font-bold tracking-tight text-gray-900 font-sans leading-none">
              LogixFlow
            </span>
          </NavLink>
          <div
            className="cursor-pointer close-icon text-gray-500 hover:text-gray-800"
            onClick={() => dispatch(setSingleSideBarToggler(false))}
          >
            <span>
              <FaAngleLeft />
            </span>
          </div>
        </div>

        <div className="single-side-panel-content">
          <nav className="sspc-nav">
            {sideBarMenus.map((menu: any) => {
              const currentUserRole = user?.role || "ADMIN";
              if (menu.roles && !menu.roles.includes(currentUserRole)) {
                return null;
              }

              if (!isMenuAllowed(menu)) {
                return null;
              }

              const Icon = navigationIcons[menu.icon as keyof typeof navigationIcons];
              const isParentActive = checkIsItemActive(menu, false);
              const isOpen = openAccordion === menu.applicationMenuId;

              return (
                <div key={menu.id || menu.applicationMenuId} className="sspc-menu-group">
                  {menu.hasTitleAbove && menu.aboveTitle && (
                    <p className="sspc-section-title">{menu.aboveTitle}</p>
                  )}

                  {menu.haveChilds ? (
                    <button
                      className={`sspc-menu-item ${isParentActive ? "sspc-menu-item--active" : ""}`}
                      onClick={() => handleParentClick(menu)}
                    >
                      <span className="sspc-menu-icon-wrap">
                        {Icon && <Icon className="sspc-menu-icon" />}
                      </span>
                      <span className="sspc-menu-label">{menu.title}</span>
                      <FaChevronDown
                        className={`sspc-chevron ${isOpen ? "sspc-chevron--open" : ""}`}
                      />
                    </button>
                  ) : (
                    <NavLink
                      to={menu.path}
                      onClick={() => handleParentClick(menu)}
                      className={({ isActive }) =>
                        `sspc-menu-item ${checkIsItemActive(menu, isActive) ? "sspc-menu-item--active" : ""}`
                      }
                    >
                      <span className="sspc-menu-icon-wrap">
                        {Icon && <Icon className="sspc-menu-icon" />}
                      </span>
                      <span className="sspc-menu-label">{menu.title}</span>
                    </NavLink>
                  )}

                  {menu.haveChilds && (
                    <div className={`sspc-submenu ${isOpen ? "sspc-submenu--open" : ""}`}>
                      <div className="sspc-submenu-inner">
                        {menu.childs?.map((child: any) => {
                          return (
                            <NavLink
                              key={child.subApplicationMenuId}
                              to={menu.path + child.path}
                              onClick={() => handleChildClick(menu, child)}
                              className={({ isActive }) =>
                                `sspc-submenu-item ${isActive ? "sspc-submenu-item--active" : ""}`
                              }
                            >
                              <span className="sspc-submenu-dot" />
                              <span className="sspc-submenu-label">{child.title}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
