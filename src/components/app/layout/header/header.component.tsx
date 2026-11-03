import { useDispatch, useSelector } from "react-redux";
import {
  setMainSideBarToggler,
  setPrimeSideBarToggler,
  setSingleSideBarToggler,
} from "@/redux/sidebar.slice";
import { reduxName } from "@/constants";
import { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { SettingsPopOverContent } from "@/components/app/layout/header-popover-content/header-popover-content";
import { CiUser } from "react-icons/ci";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useRole } from "@/hooks/use-role";
import { roles } from "@/constants/role.constants";
import { BsChevronDown } from "react-icons/bs";

export const HeaderComponent = () => {
  const dispatch = useDispatch();
  const { isBelow768px, isBelow1200px } = useBreakpoint();
  const { primeSideBarToggler, mainSideBarToggler, subMenus, singleSideBarToggler } = useSelector(
    (state: any) => state[reduxName?.sideBar],
  );
  const { userDetails: user, userType } = useRole();
  const [isScrolled, setIsScrolled] = useState(false);
  const { sideBarFormatPreference } = useSelector((state: any) => state[reduxName.preferences]);

  useEffect(() => {
    let scrollEl: Element | null = null;

    const handleScroll = () => {
      const elScrolled = (scrollEl?.scrollTop ?? 0) > 0;
      const winScrolled = window.scrollY > 0;
      setIsScrolled(elScrolled || winScrolled);
    };

    const attachListeners = () => {
      scrollEl = document.querySelector(".main-content-body");
      if (scrollEl) {
        scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
    };

    attachListeners();
    const retryTimer = setTimeout(() => {
      if (!scrollEl) {
        scrollEl = document.querySelector(".main-content-body");
        if (scrollEl) {
          scrollEl.addEventListener("scroll", handleScroll, { passive: true });
        }
      }
    }, 500);

    return () => {
      clearTimeout(retryTimer);
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`header ${sideBarFormatPreference === 1 ? "format-1" : "format-2"} ${singleSideBarToggler ? "is-header-partial-1" : ""} ${!subMenus?.haveChilds || primeSideBarToggler ? "is-header-partial-2" : ""} ${isScrolled ? "header-scrolled" : ""}`}
      >
        <div className="header-body flex justify-between items-center flex-wrap gap-2">
          {/* Left — sidebar toggle */}
          <div className="flex items-center gap-3">
            <div className="header-icon-box flex">
              <button
                onClick={() => {
                  switch (sideBarFormatPreference) {
                    case 1: {
                      dispatch(setSingleSideBarToggler(!singleSideBarToggler));
                      break;
                    }
                    case 2: {
                      if ((subMenus?.haveChilds && !isBelow768px) || isBelow768px) {
                        dispatch(setMainSideBarToggler(!mainSideBarToggler));
                        dispatch(setPrimeSideBarToggler(!primeSideBarToggler));
                      }
                      break;
                    }
                  }
                }}
                className={` ${sideBarFormatPreference === 1 ? !isBelow1200px && !singleSideBarToggler && "active" : !subMenus?.haveChilds || (!isBelow1200px && !primeSideBarToggler && "active")} sidebar-toggle-btn cursor-pointer flex size-7 flex-col justify-center space-y-1.5 theme-primary-text outline-hidden focus:outline-hidden ltr:ml-0.5 rtl:mr-0.5 `}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4">
            <div className="flex items-center gap-3">
              <Popover className="relative">
                <PopoverButton className="outline-none focus:outline-none">
                  <div className="header-user-avatar-btn flex items-center gap-3 cursor-pointer rounded-full px-1 py-1">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full ring-1 ring-gray-300 overflow-hidden bg-gray-100">
                      <CiUser size={22} />
                    </div>
                    <div className=" flex flex-col justify-start items-start">
                      <div className="text-xs font-extrabold">{user?.name || user?.userName || "Admin"}</div>
                      <div className="text-xs">{roles?.[userType] || "Admin"}</div>
                    </div>
                    <BsChevronDown size={10} className="font-bold ms-3" strokeWidth={2} />
                  </div>
                </PopoverButton>

                <Transition
                  enter="duration-200 ease-out"
                  enterFrom="translate-y-2 opacity-0"
                  enterTo="translate-y-0 opacity-100"
                  leave="duration-150 ease-in"
                  leaveFrom="translate-y-0 opacity-100"
                  leaveTo="translate-y-2 opacity-0"
                >
                  <PopoverPanel
                    anchor={{ to: "bottom end" }}
                    className="settings-pop-over z-70 flex w-64 flex-col rounded-lg bg-white border border-gray-200 shadow transition"
                  >
                    {({ close }) => <SettingsPopOverContent onClose={close} />}
                  </PopoverPanel>
                </Transition>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
