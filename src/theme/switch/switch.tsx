import clsx from "clsx";
import "@/theme/switch/switch.style.scss";
const disabledClass =
  "before:bg-gray-400 bg-gray-150 border border-gray-200 pointer-events-none select-none opacity-70 dark:bg-dark-450 dark:border-dark-450 dark:before:bg-dark-800 dark:opacity-60";

export const Switch = ({
  className,
  classNames = {},
  label,
  disabled = false,
  checked,
  onChange,
}: any) => {
  return (
    <div className="flex items-center gap-x-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={`
                    form-switch
                    ${disabled && disabledClass}
                    ${className}
                `}
      />
      {label && (
        <span className={clsx("label text-sm theme-primary-font-text", classNames?.labelText)}>
          {label}
        </span>
      )}
    </div>
  );
};
