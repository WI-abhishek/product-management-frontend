import "@/theme/checkbox/checkbox.style.scss";
import clsx from "clsx";

const disabledClass =
  "before:[mask-image:var(--tw-thumb)] before:bg-gray-400 border-gray-150 bg-gray-150 pointer-events-none select-none opacity-70";

export const Checkbox = (props: any) => {
  const {
    type = "checkbox",
    className,
    classNames = { input: "checked" },
    label,
    disabled,
    checked,
    onChange,
  } = props;

  return (
    <label className={clsx("form-checkbox inline-flex items-center gap-2", classNames?.label)}>
      <input
        type={type}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={clsx(
          "checkbox-field cursor-pointer",
          disabled && disabledClass,
          className,
          classNames?.input,
        )}
      />
      {label && <span className={clsx("label text-sm", classNames?.labelText)}>{label}</span>}
    </label>
  );
};
