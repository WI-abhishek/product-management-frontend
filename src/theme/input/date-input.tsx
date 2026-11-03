import { useField } from "formik";
import { useRef } from "react";

type DateInputProps = {
  name: string;
  id?: string;
  touched?: boolean;
  error?: string;
  inputClassName?: string;
  isDisabled?: boolean;
  onValueChange?: (value: string) => void;
};

function toDisplay(iso: string): string {
  if (!iso || iso.length !== 10) {
    return "";
  }
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export function DateInputComponent({
  name,
  touched,
  error,
  inputClassName,
  isDisabled,
  onValueChange,
}: DateInputProps) {
  const [field, , helpers] = useField(name);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const sharedClass = `input-field rounded-lg text-sm p-2 w-full duration-200
        ${touched && error ? "error-input" : ""}
        ${isDisabled ? "is-disabled" : ""}
        ${inputClassName || ""}`;

  return (
    <div className="relative w-full" style={{ height: "2.2rem" }}>
      <input
        readOnly
        tabIndex={isDisabled ? -1 : 0}
        disabled={isDisabled}
        type="text"
        value={toDisplay(field.value || "")}
        placeholder="DD-MM-YYYY"
        className={sharedClass}
        style={{ position: "absolute", inset: 0, zIndex: 1, background: "transparent" }}
        onFocus={() => hiddenRef.current?.showPicker?.()}
        onClick={() => hiddenRef.current?.showPicker?.()}
      />

      <input
        ref={hiddenRef}
        type="date"
        tabIndex={-1}
        disabled={isDisabled}
        value={field.value || ""}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          zIndex: 0,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
        onChange={(e) => {
          const value = e.target.value;
          helpers.setValue(value, true);
          onValueChange?.(value);
        }}
        onBlur={() => helpers.setTouched(true)}
      />
    </div>
  );
}
