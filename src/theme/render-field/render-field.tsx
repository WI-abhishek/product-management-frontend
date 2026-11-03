import { InputComponent } from "@/theme/input/input";
import { SelectComponent } from "@/theme/select/select";

type RenderFieldProps = {
  field?: any;
  fieldConfig?: any;
  props?: any;
  onValueChange?: (value: any) => void;
  [key: string]: any;
};

export function RenderField({
  field,
  fieldConfig,
  props,
  onValueChange,
  ...extraProps
}: RenderFieldProps) {
  const config = field || fieldConfig;
  if (!config) return null;

  const handleValueChange = onValueChange || config.onValueChange;

  if (config.fieldType === "select") {
    return (
      <SelectComponent
        key={config.name}
        {...config}
        {...extraProps}
        onValueChange={handleValueChange}
        touched={props?.touched?.[config.name]}
        error={props?.errors?.[config.name]}
      />
    );
  }

  return (
    <InputComponent
      key={config.name}
      {...config}
      {...extraProps}
      isTextArea={config.fieldType === "textarea"}
      textAreaRows={config.fieldType === "textarea" ? 3 : undefined}
      onValueChange={handleValueChange}
      touched={props?.touched?.[config.name]}
      error={props?.errors?.[config.name]}
    />
  );
}
