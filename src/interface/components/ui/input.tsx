import { Eye, EyeClosed } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@/interface/styles/utils";
import { Button } from "./button";

const BaseInput = ({
  ref,
  className,
  type,
  ...props
}: React.ComponentProps<"input"> & {
  ref?: React.RefCallback<HTMLInputElement>;
}) => {
  return (
    <input
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-3 text-lg transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
};

export type InputProps = React.ComponentProps<typeof BaseInput> & {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  startIconClassName?: string;
  endIconClassName?: string;
};

const Input = ({
  label,
  error,
  wrapperClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  endIcon,
  startIcon,
  startIconClassName,
  endIconClassName,
  ...props
}: InputProps) => {
  return (
    <div className={cn("flex flex-col gap-3", wrapperClassName)}>
      {label && (
        <label className={cn("font-semibold text-sm", labelClassName)} htmlFor={props.id}>
          {label}
        </label>
      )}

      <div className="relative flex w-full items-center">
        {startIcon && (
          <span className={cn("pointer-events-none absolute left-2 text-muted-foreground", startIconClassName)}>
            {startIcon}
          </span>
        )}
        <BaseInput
          {...props}
          className={cn(
            startIcon && "pl-9",
            endIcon && "pr-9",
            error && "border-red ring-red focus-visible:ring-red",
            inputClassName
          )}
        />
        {endIcon && (
          <span className={cn("pointer-events-none absolute right-2 text-muted-foreground", endIconClassName)}>
            {endIcon}
          </span>
        )}
      </div>

      {error && <p className={cn("text-red-500 text-sm", errorClassName)}>{error}</p>}
    </div>
  );
};

const InputForm = <T extends FieldValues>(props: InputProps & { name: Path<T>; control: Control<T> }) => {
  return (
    <Controller control={props.control} name={props.name} render={({ field }) => <Input {...props} {...field} />} />
  );
};

const InputPassword = <T extends FieldValues>(
  props: Omit<InputProps, "endIcon"> & { name: Path<T>; control: Control<T> }
) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <Input
          {...props}
          className={cn(props.className, "tracking-widest")}
          {...field}
          endIcon={
            showPassword ? (
              <Button onClick={() => setShowPassword(!showPassword)} size="icon" type="button" variant="ghost">
                <Eye />
              </Button>
            ) : (
              <Button onClick={() => setShowPassword(!showPassword)} size="icon" type="button" variant="ghost">
                <EyeClosed />
              </Button>
            )
          }
          endIconClassName="pointer-events-auto"
          type={showPassword ? "text" : "password"}
        />
      )}
    />
  );
};

export { BaseInput, Input, InputForm, InputPassword };
