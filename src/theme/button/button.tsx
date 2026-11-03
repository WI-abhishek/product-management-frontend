import { Spinner } from "@/theme/spinner/spinner";
import "@/theme/button/button.style.scss";
import React, { useMemo } from "react";

export interface ButtonProps {
  btnText: string;
  btnClass?: string;
  btnType?: "button" | "submit" | "reset";
  themeType?: string;
  variant?:
    "primary" | "secondary" | "outline" | "reset" | "light" | "indigo" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  onBtnClick?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function Button({
  btnText,
  btnClass = "",
  btnType = "button",
  themeType,
  variant,
  size = "sm",
  isLoading = false,
  onBtnClick,
  isDisabled = false,
  leftContent,
  rightContent,
}: ButtonProps) {
  const activeVariant = variant || themeType;

  const variantClass = useMemo(() => {
    switch (activeVariant) {
      case "reset":
      case "outline":
        return "reset-btn";
      case "secondary":
      case "light":
        return "light-btn";
      case "indigo":
        return "indigo-btn";
      case "danger":
        return "danger-btn";
      case "success":
        return "success-btn";
      default:
        return "";
    }
  }, [activeVariant]);

  const sizeClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "h-9 px-3.5 text-xs";
      case "md":
        return "h-10 px-4 text-sm";
      case "lg":
        return "h-12 px-5 text-base";
      default:
        return "h-12";
    }
  }, [size]);

  return (
    <button
      disabled={isDisabled}
      className={`theme-btn font-semibold rounded-lg flex items-center justify-center gap-2 ${sizeClass}
                ${variantClass}
                ${isDisabled ? "btn-disabled" : ""}
                ${btnClass}
                duration-200`}
      type={btnType}
      onClick={() => onBtnClick?.()}
    >
      {isLoading ? (
        <Spinner color="" isElastic />
      ) : (
        <>
          {leftContent && <span className="flex items-center font-semibold">{leftContent}</span>}

          <span className="font-semibold">{btnText}</span>

          {rightContent && <span className="flex items-center font-semibold">{rightContent}</span>}
        </>
      )}
    </button>
  );
}
