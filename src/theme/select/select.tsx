import { useField } from "formik";
import { FaPlus, FaCheck } from "react-icons/fa6";
import "@/theme/select/select.style.scss";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { undefinedAndNullChecker } from "@/constants";
import debounce from "lodash/debounce";
import { Spinner } from "@/theme/spinner/spinner";
import { Transition } from "@headlessui/react";

type SelectBaseProps = {
  value?: any;
  onChangeValue?: (value: any) => void;
  onBlurField?: () => void;
  touched?: boolean;
  error?: any;
  fieldName?: string;
  label?: string;
  id?: string;
  options?: any;
  fieldType?: string;
  mainBoxClassName?: string;
  labelBoxClassName?: string;
  errorBoxClassName?: string;
  placeholder?: string;
  isVertical?: boolean;
  isPrefixbtn?: boolean;
  prefixBtnText?: string;
  isPrefixBtnIcon?: boolean;
  PrefixBtnIcon?: any;
  prefixBtnFun?: () => void;
  isSuffixbtn?: boolean;
  suffixBtnText?: string;
  isSuffixBtnIcon?: boolean;
  SuffixBtnIcon?: any;
  suffixBtnFun?: () => void;
  isClearable?: any;
  isServerSide?: boolean;
  callServerAPI?: (query: any) => Promise<any>;
  isRequired?: boolean;
  isDisabled?: boolean;
  isNewCreatable?: boolean;
  onCreateOption?: (inputValue: string, fieldName: string) => Promise<void> | void;
  initialServerLoad?: boolean;
  onInitialLoad?: () => Promise<any>;
  isReadOnly?: boolean;
  noFocusNext?: boolean;
  isLoading?: boolean;
  inputStyle?: React.CSSProperties;
  getOptionStyle?: (option: any) => React.CSSProperties | undefined;
};

// ─────────────────────────────────────────────────────────────
// SelectBase — full theme dropdown, no Formik dependency.
// Use this directly wherever you need the select outside a form.
// ─────────────────────────────────────────────────────────────
export function SelectBase({
  value: valueProp,
  onChangeValue,
  onBlurField,
  touched = false,
  error,
  fieldName = "",
  label,
  id,
  options = [],
  mainBoxClassName,
  labelBoxClassName,
  errorBoxClassName,
  placeholder,
  isVertical = true,
  isPrefixbtn = false,
  prefixBtnText = "",
  isPrefixBtnIcon = false,
  PrefixBtnIcon = FaPlus,
  prefixBtnFun,
  isSuffixbtn = false,
  suffixBtnText = "",
  isSuffixBtnIcon = false,
  SuffixBtnIcon = FaPlus,
  suffixBtnFun,
  isClearable = false,
  isServerSide = false,
  callServerAPI,
  isRequired = false,
  isDisabled = false,
  isNewCreatable = false,
  onCreateOption,
  initialServerLoad = false,
  onInitialLoad,
  isReadOnly = false,
  noFocusNext = true,
  isLoading = false,
  inputStyle,
  getOptionStyle,
}: SelectBaseProps) {
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputFieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionRefs: any = useRef([]);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward?: boolean;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(touched);
  // Internal value for uncontrolled-like instant feedback;
  // syncs back to valueProp whenever the parent updates it
  const [internalValue, setInternalValue] = useState(valueProp ?? null);
  const selectedOption = valueProp !== undefined ? (valueProp ?? null) : (internalValue ?? null);

  // Keep internal value in sync when valueProp changes from outside
  useEffect(() => {
    setInternalValue(valueProp ?? null);
  }, [valueProp]);

  const [searchText, setSearchText] = useState("");
  const [serversearchText, setserversearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [serverOptions, setServerOptions] = useState<any[]>([]);
  const [initialServerOptions, setInitialServerOptions] = useState<any[]>([]);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [staticInitialOptions, setStaticInitialOptions] = useState<any[]>([]);

  const updateDropdownPosition = useCallback(() => {
    if (inputFieldRef.current) {
      const rect = inputFieldRef.current.getBoundingClientRect();
      const dropdownMaxHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow;
      setDropdownPosition({
        top: openUpward ? rect.top + window.scrollY - 4 : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        openUpward,
      });
    }
  }, []);

  const loadOptions = useCallback(
    debounce(async (query: any, callback: any) => {
      try {
        const response = await callServerAPI?.(query);
        callback(response || []);
      } finally {
        setIsOptionsLoading(false);
      }
    }, 500),
    [callServerAPI],
  );

  const filteredOptions = useMemo(() => {
    const base =
      !isServerSide && initialServerLoad && staticInitialOptions.length > 0
        ? staticInitialOptions
        : options;
    return base?.filter((opt: any) =>
      opt?.label?.toLowerCase().includes(searchText?.toLowerCase()),
    );
  }, [options, staticInitialOptions, searchText, isServerSide, initialServerLoad]);

  const filteredInitialOptions = useMemo(() => {
    if (!initialServerLoad) return [];
    return initialServerOptions.filter((opt: any) =>
      opt?.label?.toLowerCase().includes(serversearchText?.toLowerCase()),
    );
  }, [initialServerOptions, serversearchText, initialServerLoad]);

  const currentOptions = useMemo(() => {
    if (isServerSide) {
      let opts: any[] = [];
      if (initialServerLoad) {
        opts =
          !isTyping || serversearchText.trim() === ""
            ? initialServerOptions
            : filteredInitialOptions.length > 0
              ? filteredInitialOptions
              : serverOptions;
      } else {
        opts = serverOptions;
      }
      if (selectedOption?.value) {
        const inList = opts.some((o: any) => o.value === selectedOption.value);
        if (!inList) return [selectedOption, ...opts];
      }
      return opts;
    }
    return filteredOptions;
  }, [
    isServerSide,
    initialServerLoad,
    isTyping,
    serversearchText,
    initialServerOptions,
    filteredInitialOptions,
    serverOptions,
    filteredOptions,
    selectedOption,
  ]);

  const showCreateOption = useMemo(() => {
    if (!isNewCreatable) return false;
    const typedText = isServerSide ? serversearchText.trim() : searchText.trim();
    if (!typedText) return false;
    return currentOptions.length === 0;
  }, [isNewCreatable, isServerSide, serversearchText, searchText, currentOptions]);

  const resetServerState = (resetInitial = false) => {
    setServerOptions([]);
    setIsTyping(false);
    if (resetInitial) {
      setInitialServerOptions([]);
      setIsInitialLoaded(false);
    }
  };

  const handleSelectOption = (option: any) => {
    onChangeValue?.(option);
    setInternalValue(option);
    setIsTouched(true);
    setOpen(false);
    setIsTyping(false);
    if (isServerSide) {
      setserversearchText(option.label);
      setServerOptions([]);
    } else {
      setSearchText("");
    }
    if (!noFocusNext) {
      if (focusNextTimeoutRef.current) {
        clearTimeout(focusNextTimeoutRef.current);
      }
      focusNextTimeoutRef.current = setTimeout(() => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ) as HTMLElement[];
        const currentIndex = focusableElements.findIndex((el) => el === inputRef.current);
        if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
          focusableElements[currentIndex + 1].focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = async (e: any) => {
    const maxIndex = currentOptions?.length ? currentOptions.length - 1 : -1;
    if (e.key === "Tab") {
      if (open) {
        if (isServerSide) {
          setserversearchText(selectedOption?.label ?? "");
          resetServerState(false);
        }
        setOpen(false);
      }
      return;
    }
    if (e.key === "Escape") {
      if (isServerSide) {
        setserversearchText(selectedOption?.label ?? "");
        resetServerState(initialServerLoad);
      }
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open) return;
    if (maxIndex < 0 && !showCreateOption) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const option = currentOptions[focusedIndex];
      if (!option && showCreateOption) {
        const inputVal = (isServerSide ? serversearchText : searchText).trim();
        if (inputVal) {
          setIsCreating(true);
          if (isServerSide) {
            setserversearchText("");
            setIsTyping(false);
          } else {
            setSearchText("");
          }
          setOpen(false);
          await onCreateOption?.(inputVal, fieldName);
          setIsCreating(false);
        }
        return;
      }
      if (!option) return;
      handleSelectOption(option);
      setFocusedIndex(-1);
    }
  };

  const handleInputChange = (e: any) => {
    const val = e.target.value;
    if (isServerSide) {
      setserversearchText(val);
      setIsTyping(true);
      if (val.length === 0) {
        onChangeValue?.(null);
        setInternalValue(null);
        setIsTouched(true);
        setIsTyping(false);
        setIsOptionsLoading(false);
        loadOptions.cancel();
        if (initialServerLoad) setServerOptions(initialServerOptions);
        else setServerOptions([]);
        return;
      }
      if (initialServerLoad) {
        const localMatch = initialServerOptions.some((opt: any) =>
          opt.label.toLowerCase().includes(val.toLowerCase()),
        );
        if (!localMatch) {
          setIsOptionsLoading(true);
          loadOptions(val, setServerOptions);
        } else {
          loadOptions.cancel();
          setIsOptionsLoading(false);
          setServerOptions([]);
        }
      } else {
        setIsOptionsLoading(true);
        loadOptions(val, setServerOptions);
      }
    } else {
      setSearchText(val);
    }
  };

  const handleInputFocus = () => {
    updateDropdownPosition();
    setOpen(true);
    if (isServerSide && !isTyping) {
      setserversearchText("");
      setIsTyping(false);
      if (initialServerLoad) {
        if (initialServerOptions.length > 0) setServerOptions(initialServerOptions);
      } else {
        setIsOptionsLoading(true);
        callServerAPI?.("").then((results: any) => {
          setServerOptions(results || []);
          setIsOptionsLoading(false);
        });
      }
    }
  };

  useEffect(() => {
    if (isServerSide && initialServerLoad && open && !isInitialLoaded) {
      setIsOptionsLoading(true);
      callServerAPI?.("").then((results: any) => {
        setInitialServerOptions(results || []);
        setServerOptions(results || []);
        setIsOptionsLoading(false);
        setIsInitialLoaded(true);
      });
    }
  }, [open, isServerSide, initialServerLoad, isInitialLoaded]);

  useEffect(() => {
    if (!isServerSide && initialServerLoad && open && !isInitialLoaded && onInitialLoad) {
      setIsOptionsLoading(true);
      onInitialLoad().then((results: any) => {
        setStaticInitialOptions(results || []);
        setIsOptionsLoading(false);
        setIsInitialLoaded(true);
      });
    }
  }, [open, isServerSide, initialServerLoad, isInitialLoaded, onInitialLoad]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInsideWrapper = wrapperRef.current?.contains(target);
      const isInsidePortal = dropdownRef.current?.contains(target);
      if (!isInsideWrapper && !isInsidePortal) {
        if (isServerSide) {
          setserversearchText(selectedOption?.label ?? "");
          setIsTyping(false);
          resetServerState(false);
        }
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isServerSide, selectedOption]);

  useEffect(() => {
    if (open) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (focusedIndex < 0) return;
    const el = optionRefs.current[focusedIndex];
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIndex]);

  useEffect(() => {
    optionRefs.current = [];
  }, [currentOptions]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = currentOptions?.findIndex(
      (opt: any) => opt.value === selectedOption?.value,
    );
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open]);

  useEffect(() => {
    if (isServerSide) {
      setserversearchText(selectedOption?.label ?? "");
      setIsTyping(false);
    }
  }, [selectedOption?.value, isServerSide]);

  useEffect(() => {
    return () => {
      loadOptions.cancel();
      if (focusNextTimeoutRef.current) {
        clearTimeout(focusNextTimeoutRef.current);
      }
    };
  }, [loadOptions]);

  const inputDisplayValue = isServerSide
    ? (serversearchText ?? "")
    : open
      ? searchText
      : searchText || selectedOption?.label || "";

  const hasError = isTouched && !!error && !undefinedAndNullChecker(selectedOption?.value);

  const resolvedInputStyle: React.CSSProperties =
    getOptionStyle?.(selectedOption) ?? inputStyle ?? {};

  const renderOptions = () => {
    const isUpward = dropdownPosition?.openUpward;
    const originClass = isUpward ? "origin-bottom" : "origin-top";
    const translateOffset = isUpward ? "translate-y-2" : "-translate-y-2";

    const dropdownContent = (
      <Transition
        as="div"
        show={open && !!dropdownPosition}
        ref={dropdownRef}
        enter="transition duration-180 ease-out transform"
        enterFrom={`opacity-0 scale-95 ${translateOffset} ${originClass}`}
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition duration-130 ease-in transform pointer-events-none"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo={`opacity-0 scale-95 ${translateOffset} ${originClass}`}
        className={`select-dropdown select-portal-dropdown ${isUpward ? "open-upward" : ""} custom-scrollbar`}
        style={
          dropdownPosition
            ? {
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }
            : {}
        }
      >
        {currentOptions.length > 0 ? (
          currentOptions.map((option: any, index: any) => (
            <div
              key={`${index}-${option?.value}`}
              ref={(el: any) => (optionRefs.current[index] = el)}
              className={`select-option 
                ${option.value === selectedOption?.value ? "active" : ""} 
                cursor-pointer flex flex-row justify-between items-center
                ${index === focusedIndex ? "focused" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectOption(option);
              }}
            >
              <span className="text-sm truncate">{option?.label}</span>
              <span className="text-sm">
                {option?.value === selectedOption?.value && <FaCheck />}
              </span>
            </div>
          ))
        ) : isOptionsLoading ? (
          <div className="select-option text-center">
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : showCreateOption ? (
          <div
            className="select-option cursor-pointer flex flex-row items-center gap-2"
            onMouseDown={async (e) => {
              e.preventDefault();
              const inputVal = (isServerSide ? serversearchText : searchText).trim();
              setIsCreating(true);
              if (isServerSide) {
                setserversearchText("");
                setIsTyping(false);
              } else {
                setSearchText("");
              }
              setOpen(false);
              await onCreateOption?.(inputVal, fieldName);
              setIsCreating(false);
            }}
          >
            {isCreating ? (
              <span className="text-sm text-gray-400">Creating...</span>
            ) : (
              <>
                <FaPlus className="text-xs" />
                <span className="text-sm">
                  Create "{(isServerSide ? serversearchText : searchText).trim()}"
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="select-option text-center">
            <span className="text-sm truncate text-gray-500">No option found</span>
          </div>
        )}
      </Transition>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div
      ref={wrapperRef}
      className={`theme-select-box ${isVertical ? "direction-column" : "direction-row"} ${mainBoxClassName}`}
    >
      {label && (
        <label
          htmlFor={id || fieldName}
          className={`label font-semibold text-sm ${labelBoxClassName}`}
        >
          {label} {isRequired && <span className="text-xs theme-delete-color-text">*</span>}{" "}
          {!isVertical && ":"}
        </label>
      )}

      <div className="">
        <div className={`input-field-box ${label ? (isVertical ? "mt-1.75" : "ms-1.75") : ""}`}>
          {isPrefixbtn && (
            <button
              className="prefix-btn px-3 rounded-s-md cursor-pointer text-sm"
              type="button"
              onClick={prefixBtnFun}
            >
              {isPrefixBtnIcon ? <PrefixBtnIcon /> : prefixBtnText}
            </button>
          )}
          <div
            ref={inputFieldRef}
            className={`input-field flex items-center justify-between cursor-pointer 
              ${isPrefixbtn && isSuffixbtn ? "" : isPrefixbtn ? "rounded-e-lg" : isSuffixbtn ? "rounded-s-md" : "rounded-lg"} 
              text-sm px-2 py-4 w-full 
              ${hasError && "error-input"} 
              ${isDisabled && "is-disabled"}
              duration-200`}
            style={resolvedInputStyle}
            onClick={() => {
              updateDropdownPosition();
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <input
              ref={inputRef}
              tabIndex={isDisabled ? -1 : 0}
              disabled={isDisabled}
              readOnly={isReadOnly}
              inputMode={isReadOnly ? "none" : undefined}
              value={inputDisplayValue}
              style={{ color: resolvedInputStyle.color }}
              className={`w-full bg-transparent  outline-none ${selectedOption?.label && !isTyping && "option-selected"} ${isReadOnly ? "caret-transparent" : ""}`}
              placeholder={placeholder}
              onFocus={handleInputFocus}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsTouched(true);
                onBlurField?.();
                if (isServerSide && !open) {
                  setserversearchText(selectedOption?.label ?? "");
                  setIsTyping(false);
                }
              }}
            />
            <div className="flex flex-row items-center">
              {isOptionsLoading || isLoading ? (
                <span className="me-2">
                  <Spinner isElastic />
                </span>
              ) : (
                isClearable &&
                selectedOption &&
                selectedOption?.value !== undefined &&
                selectedOption?.value !== null &&
                selectedOption?.value !== "" && (
                  <span>
                    <MdOutlineCancel
                      color="red"
                      size={18}
                      className="cross-icon me-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChangeValue?.(null);
                        setInternalValue(null);
                        setSearchText("");
                        setIsTouched(true);
                        if (isServerSide) {
                          setserversearchText("");
                          setIsTyping(false);
                          setServerOptions([]);
                        }
                        setOpen(false);
                        inputRef.current?.blur();
                      }}
                    />
                  </span>
                )
              )}
              <span>
                <IoIosArrowDown
                  style={{ color: open ? "var(--primary)" : resolvedInputStyle.color }}
                  className={`arrow-icon duration-200 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </span>
            </div>
          </div>
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

        {renderOptions()}

        {hasError && (
          <div
            className={`error text-xs pt-1 ${isVertical ? "ps-1" : "ps-2"} ${errorBoxClassName}`}
          >
            {typeof error === "string" ? error : error?.label || error?.value || "Required"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SelectComponent — Formik-connected wrapper around SelectBase
// ─────────────────────────────────────────────────────────────
type SelectProps = {
  name: string;
  label?: string;
  id?: string;
  touched?: boolean;
  error?: any;
  options?: any;
  fieldType?: string;
  mainBoxClassName?: string;
  labelBoxClassName?: string;
  errorBoxClassName?: string;
  placeholder?: string;
  isVertical?: boolean;
  isPrefixbtn?: boolean;
  prefixBtnText?: string;
  isPrefixBtnIcon?: boolean;
  PrefixBtnIcon?: any;
  prefixBtnFun?: () => void;
  isSuffixbtn?: boolean;
  suffixBtnText?: string;
  isSuffixBtnIcon?: boolean;
  SuffixBtnIcon?: any;
  suffixBtnFun?: () => void;
  onValueChange?: (value: any) => void;
  defaultValue?: any;
  isClearable?: any;
  isServerSide?: boolean;
  callServerAPI?: (query: any) => Promise<any>;
  isRequired?: boolean;
  isDisabled?: boolean;
  isNewCreatable?: boolean;
  onCreateOption?: (inputValue: string, fieldName: string) => Promise<void> | void;
  initialServerLoad?: boolean;
  onInitialLoad?: () => Promise<any>;
  isReadOnly?: boolean;
  noFocusNext?: boolean;
  isLoading?: boolean;
};

export function SelectComponent({
  label,
  id,
  error,
  options = [],
  mainBoxClassName,
  labelBoxClassName,
  errorBoxClassName,
  placeholder,
  isVertical = true,
  isPrefixbtn = false,
  prefixBtnText = "",
  isPrefixBtnIcon = false,
  PrefixBtnIcon = FaPlus,
  prefixBtnFun,
  isSuffixbtn = false,
  suffixBtnText = "",
  isSuffixBtnIcon = false,
  SuffixBtnIcon = FaPlus,
  suffixBtnFun,
  onValueChange,
  isClearable = false,
  isServerSide = false,
  callServerAPI,
  isRequired = false,
  isDisabled = false,
  isNewCreatable = false,
  onCreateOption,
  initialServerLoad = false,
  onInitialLoad,
  isReadOnly = false,
  noFocusNext = false,
  isLoading = false,
  ...props
}: SelectProps) {
  const [field, meta, helpers] = useField(props.name);

  return (
    <SelectBase
      value={field.value ?? null}
      onChangeValue={(option) => {
        helpers.setValue(option, true);
        helpers.setTouched(true);
        onValueChange?.(option);
      }}
      onBlurField={() => helpers.setTouched(true)}
      touched={meta.touched}
      error={error ?? meta.error}
      fieldName={props.name}
      label={label}
      id={id}
      options={options}
      mainBoxClassName={mainBoxClassName}
      labelBoxClassName={labelBoxClassName}
      errorBoxClassName={errorBoxClassName}
      placeholder={placeholder}
      isVertical={isVertical}
      isPrefixbtn={isPrefixbtn}
      prefixBtnText={prefixBtnText}
      isPrefixBtnIcon={isPrefixBtnIcon}
      PrefixBtnIcon={PrefixBtnIcon}
      prefixBtnFun={prefixBtnFun}
      isSuffixbtn={isSuffixbtn}
      suffixBtnText={suffixBtnText}
      isSuffixBtnIcon={isSuffixBtnIcon}
      SuffixBtnIcon={SuffixBtnIcon}
      suffixBtnFun={suffixBtnFun}
      isClearable={isClearable}
      isServerSide={isServerSide}
      callServerAPI={callServerAPI}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isNewCreatable={isNewCreatable}
      onCreateOption={onCreateOption}
      initialServerLoad={initialServerLoad}
      onInitialLoad={onInitialLoad}
      isReadOnly={isReadOnly}
      noFocusNext={noFocusNext}
      isLoading={isLoading}
    />
  );
}
