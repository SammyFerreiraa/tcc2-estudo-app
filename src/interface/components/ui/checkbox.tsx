"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/interface/styles/utils";

const Checkbox = ({
  className,
  error,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  error?: boolean;
}) => {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input bg-transparent shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        error && "border-red ring-red focus-visible:ring-red",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  errorClassName?: string;
  labelPosition?: "left" | "right";
};

const CheckboxWithLabel = ({
  label,
  error,
  wrapperClassName,
  labelClassName,
  checkboxClassName,
  errorClassName,
  labelPosition = "right",
  id,
  ...props
}: CheckboxProps) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const checkboxElement = <Checkbox className={checkboxClassName} error={!!error} id={checkboxId} {...props} />;

  const labelElement = label ? (
    <label
      className={cn(
        "cursor-pointer select-none font-medium text-sm leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        labelClassName
      )}
      htmlFor={checkboxId}
    >
      {label}
    </label>
  ) : null;

  if (!(label || error)) {
    return checkboxElement;
  }

  const containerClasses = cn("flex items-center space-x-2", wrapperClassName);

  if (!label && error) {
    return (
      <div className={cn("flex flex-col space-y-2", wrapperClassName)}>
        {checkboxElement}
        <p className={cn("text-red-500 text-sm", errorClassName)}>{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-2")}>
      <div className={containerClasses}>
        {labelPosition === "left" && labelElement}
        {checkboxElement}
        {labelPosition === "right" && labelElement}
      </div>
      {error && <p className={cn("text-red-500 text-sm", errorClassName)}>{error}</p>}
    </div>
  );
};

export { Checkbox, CheckboxWithLabel };
