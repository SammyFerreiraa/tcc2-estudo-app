import type { UseFormReturn } from "react-hook-form";
import { type Control, Controller, type FieldValues, FormProvider, type Path } from "react-hook-form";
import { cn } from "../styles/utils";
import { type CheckboxProps, CheckboxWithLabel } from "./ui/checkbox";
import { DatePicker, type DatePickerProps } from "./ui/date-picker";
import { FileUpload, type FileUploadProps } from "./ui/file-upload";
import { Input, type InputProps } from "./ui/input";
import { type SelectProps, SelectWithLabel } from "./ui/select";
import type { SwitchProps } from "./ui/switch";
import { Switch } from "./ui/switch";
import { type DataTableProps, Table } from "./ui/table";

const Form = <T extends FieldValues>({
  methods,
  children,
  onSubmit,
  className,
}: {
  methods: UseFormReturn<T, unknown, T>;
  children: React.ReactNode;
  onSubmit: (data: T) => void;
  className?: string;
}) => {
  return (
    <FormProvider {...methods}>
      <form className={cn("flex flex-col gap-4", className)} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};

const InputForm = <T extends FieldValues>(props: InputProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller control={props.control} name={props.name} render={({ field }) => <Input {...props} {...field} />} />
  );
};

const SwitchForm = <T extends FieldValues>(props: SwitchProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller control={props.control} name={props.name} render={({ field }) => <Switch {...props} {...field} />} />
  );
};

const SelectForm = <T extends FieldValues>(props: SelectProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field }) => <SelectWithLabel {...props} {...field} />}
    />
  );
};

const CheckboxForm = <T extends FieldValues>(props: CheckboxProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field: { value, onChange, ...field } }) => (
        <CheckboxWithLabel {...props} {...field} checked={value} onCheckedChange={onChange} />
      )}
    />
  );
};

const FileUploadForm = <T extends FieldValues>(props: FileUploadProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field: { value, onChange, ...field } }) => (
        <FileUpload {...props} {...field} onFilesChange={onChange} value={value} />
      )}
    />
  );
};

const DatePickerForm = <T extends FieldValues>(props: DatePickerProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field: { value, onChange, ...field } }) => (
        <DatePicker {...props} {...field} onValueChange={onChange} value={value} />
      )}
    />
  );
};

const TableComponent = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
  return <Table {...props} />;
};

Form.Input = InputForm;
Form.Switch = SwitchForm;
Form.Select = SelectForm;
Form.Checkbox = CheckboxForm;
Form.FileUpload = FileUploadForm;
Form.DatePicker = DatePickerForm;
Form.Table = TableComponent;

export { Form };
