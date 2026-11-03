import "@/theme/spinner/spinner.style.scss";
import clsx from "clsx";

export function Spinner({
  className,
  animate = true,
  isElastic,
  disabled,
  color = "var(--primary)",
}: any) {
  return (
    <div
      className={clsx(
        "spinner spinner-base rounded-full w-[1rem] h-[1rem]",
        isElastic && "is-elastic",
        animate && !disabled && "animate-spin",
        disabled && "opacity-50",
        className,
      )}
      style={{
        borderColor: color,
        borderRightColor: "transparent",
      }}
      aria-disabled={disabled}
    />
  );
}
