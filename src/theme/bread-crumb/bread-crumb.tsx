import { NavLink } from "react-router";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { Button } from "@/theme/button/button";
import { IoMdAdd } from "react-icons/io";

export function Breadcrumb({
  items = [],
  mainTitle = "",
  mainSubTitle = "",
  classNames = {},
  isRtl = false,
  isRightButton = false,
  btnText = "",
  onBtnClick,
}: any) {
  const SeparatorIcon = isRtl ? HiChevronLeft : HiChevronRight;
  return (
    <>
      <div className="flex flex-row flex-wrap justify-between gap-y-2">
        <div className="flex items-center space-x-4">
          {mainTitle && (
            <>
              <h2
                className={`text-xl font-semibold tracking-wide theme-bold-font-color-text lg:text-2xl ${classNames?.mainTitle}`}
              >
                {mainTitle}
                {mainSubTitle && (
                  <p className="theme-general-font-color-text text-xs mt-1">{mainSubTitle}</p>
                )}
              </h2>
              {items?.length > 0 && (
                <div className="hidden self-stretch py-1 sm:flex">
                  <div className="dark:bg-dark-600 h-full w-px bg-gray-300"></div>
                </div>
              )}
            </>
          )}
          <ul className={`flex flex-wrap items-center gap-1.5 max-sm:hidden ${classNames?.items}`}>
            {items?.map((item: any, i: any) => (
              <li key={i} className="flex items-center gap-1.5 text-sm">
                {items?.length - 1 !== i ? (
                  <>
                    {item?.path ? (
                      <NavLink to={item?.path} className="tracking-wide theme-primary-text">
                        {item?.title}
                      </NavLink>
                    ) : (
                      <span className={"tracking-wide theme-primary-font-text"}>
                        {" "}
                        {item?.title}
                      </span>
                    )}
                    <SeparatorIcon className="size-5" />
                  </>
                ) : (
                  <span className={"tracking-wide theme-primary-font-text"}> {item?.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {isRightButton && (
          <>
            <div>
              <Button
                btnText={btnText}
                btnType="button"
                leftContent={<IoMdAdd strokeWidth={22} />}
                onBtnClick={() => onBtnClick()}
                btnClass={"px-3 text-sm h-8.75"}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
