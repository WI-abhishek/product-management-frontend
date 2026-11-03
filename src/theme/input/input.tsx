import { useField } from "formik";
import { FaPlus } from "react-icons/fa6";
import "@/theme/input/input.style.scss";
import { DateInputComponent } from "@/theme/input/date-input";

type InputProps = {
  name: string;
  label?: string;
  id?: string;
  touched?: boolean;
  error?: string;
  fieldType?: string;
  mainBoxClassName?: string;
  inputClassName?: string;
  labelBoxClassName?: string;
  errorBoxClassName?: string;
  placeholder?: string;
  isVertical?: boolean;
  isPrefixbtn?: boolean;
  prefixBtnText?: string;
  isPrefixBtnIcon?: boolean;
  PrefixBtnIcon?: any;
  prefixBtnFun?: () => void;
  prefixBtnClass?: string;
  isPrefixShowIcon?: boolean;
  PrefixShowIcon?: any;
  isSuffixbtn?: boolean;
  suffixBtnText?: string;
  isSuffixBtnIcon?: boolean;
  SuffixBtnIcon?: any;
  suffixBtnFun?: () => void;
  isSuffixShowIcon?: boolean;
  SuffixShowIcon?: any;
  hasBackground?: boolean;
  isTextArea?: boolean;
  textAreaRows?: number;
  isRequired?: boolean;
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
  autoComplete?: string;
  min?: string;
  max?: string;
  step?: string | number;
};

export function InputComponent({
  name,
  label,
  id,
  touched: touchedProp,
  error: errorProp,
  fieldType = "text",
  mainBoxClassName,
  inputClassName,
  labelBoxClassName,
  errorBoxClassName,
  placeholder,
  isVertical = true,
  isPrefixbtn = false,
  prefixBtnText = "",
  isPrefixBtnIcon = false,
  PrefixBtnIcon = FaPlus,
  prefixBtnFun,
  prefixBtnClass,
  isPrefixShowIcon = false,
  PrefixShowIcon,
  isSuffixbtn = false,
  suffixBtnText = "",
  isSuffixBtnIcon = false,
  SuffixBtnIcon = FaPlus,
  suffixBtnFun,
  isSuffixShowIcon = false,
  SuffixShowIcon,
  hasBackground = false,
  isTextArea = false,
  textAreaRows = 4,
  isRequired = false,
  onValueChange,
  isDisabled = false,
  autoComplete,
  min,
  max,
  step,
}: InputProps) {
  const [field, meta] = useField(name);
  const touched = touchedProp ?? meta.touched;
  const error = errorProp ?? meta.error;

  return (
    <div
      className={`theme-input-box ${isVertical ? "direction-column" : "direction-row"} ${mainBoxClassName}`}
    >
      {label && (
        <label
          htmlFor={id || name}
          className={`label font-semibold text-sm ${isDisabled && "is-disabled"} ${labelBoxClassName}`}
        >
          {label} {isRequired && <span className={`text-xs theme-delete-color-text`}>*</span>}{" "}
          {!isVertical && ":"}
        </label>
      )}

      <div>
        <div
          className={`input-field-box relative
                     ${label ? (isVertical ? "mt-1.75" : "ms-1.75") : ""}
                     ${isTextArea ? "textarea-box" : ""}
                     `}
        >
          {isPrefixbtn && (
            <button
              className={`prefix-btn px-3 rounded-s-md cursor-pointer text-sm ${prefixBtnClass}`}
              type="button"
              onClick={prefixBtnFun}
            >
              {isPrefixBtnIcon ? <PrefixBtnIcon /> : prefixBtnText}
            </button>
          )}
          {isPrefixShowIcon && (
            <div className="ps-4 rounded-s-md absolute">
              <span>
                <PrefixShowIcon color="#AAB7C9" strokeWidth={2} />
              </span>
            </div>
          )}
          {!isTextArea ? (
            fieldType === "date" ? (
              <DateInputComponent
                name={name}
                id={id}
                touched={touched}
                error={error}
                inputClassName={`
                                        ${
                                          isPrefixbtn && isSuffixbtn
                                            ? ""
                                            : isPrefixbtn
                                              ? "rounded-e-lg"
                                              : isSuffixbtn
                                                ? "rounded-s-md"
                                                : isPrefixShowIcon && isSuffixShowIcon
                                                  ? ""
                                                  : isPrefixShowIcon
                                                    ? "rounded-e-lg"
                                                    : isSuffixShowIcon
                                                      ? "rounded-s-md"
                                                      : "rounded-lg"
                                        }
                                        ${hasBackground ? "with-bg" : ""}
                                        ${inputClassName || ""}
                                    `}
                isDisabled={isDisabled}
                onValueChange={onValueChange}
              />
            ) : (
              <input
                tabIndex={isDisabled ? -1 : 0}
                disabled={isDisabled}
                spellCheck={false}
                type={`${fieldType}`}
                className={`input-field ${isPrefixbtn && isSuffixbtn ? "" : isPrefixbtn ? "rounded-e-lg" : isSuffixbtn ? "rounded-s-lg" : isPrefixShowIcon && isSuffixShowIcon ? "" : isPrefixShowIcon ? "rounded-e-lg" : isSuffixShowIcon ? "rounded-s-lg" : "rounded-lg"}
                                        text-sm p-2 w-full duration-200 ${hasBackground && "with-bg"} ${touched && error && "error-input"} 
                                        ${isDisabled && "is-disabled"}
                                        ${inputClassName}    
                                        ${isPrefixShowIcon ? "ps-10 rounded-s-lg" : ""}
                                        `}
                id={id || name}
                placeholder={placeholder}
                autoComplete={autoComplete}
                min={min}
                max={max}
                step={step}
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onValueChange) {
                    onValueChange(value);
                  } else {
                    field.onChange(e);
                  }
                }}
              />
            )
          ) : (
            <div className="w-full">
              <textarea
                id={id || name}
                placeholder={placeholder}
                spellCheck={false}
                className={`textarea-field rounded-lg text-sm w-full p-2 duration-200
                                     ${touched && error && "error-input"}`}
                rows={textAreaRows}
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onValueChange) {
                    onValueChange(value);
                  } else {
                    field.onChange(e);
                  }
                }}
              />
            </div>
          )}
          {isSuffixShowIcon && (
            <div className="suffix-show-icon px-2 rounded-e-lg">
              <span>
                <SuffixShowIcon />
              </span>
            </div>
          )}
          {isSuffixbtn && (
            <button
              className="suffix-btn px-3 rounded-e-lg cursor-pointer"
              type="button"
              onClick={suffixBtnFun}
            >
              {isSuffixBtnIcon ? <SuffixBtnIcon /> : suffixBtnText}
            </button>
          )}
        </div>

        {touched && error && (
          <div
            className={`error text-xs pt-1 ${isVertical ? "ps-1" : "ps-2"}  ${errorBoxClassName}`}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
