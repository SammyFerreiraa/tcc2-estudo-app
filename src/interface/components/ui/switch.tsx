"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/interface/styles/utils";

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  label?: string;
  labelPosition?: "top" | "left" | "right" | "bottom";
  labelClassName?: string;
  containerClassName?: string;
  error?: string;
  errorClassName?: string;
};

const Switch = ({
  className,
  label,
  labelPosition = "right",
  labelClassName,
  containerClassName,
  error,
  errorClassName,
  id,
  ...props
}: SwitchProps) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const switchElement = (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      data-slot="switch"
      id={switchId}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );

  const labelElement = label ? (
    <label
      className={cn(
        "cursor-pointer select-none font-medium text-sm leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        labelClassName
      )}
      htmlFor={switchId}
    >
      {label}
    </label>
  ) : null;

  if (!(label || error)) {
    return switchElement;
  }

  const containerClasses = cn(
    "flex",
    {
      "flex-col space-y-2": labelPosition === "top" || labelPosition === "bottom",
      "flex-row items-center space-x-2": labelPosition === "left" || labelPosition === "right",
    },
    containerClassName
  );

  // Para exibir apenas o switch com erro, sem label
  if (!label && error) {
    return (
      <div className={cn("flex flex-col space-y-2", containerClassName)}>
        {switchElement}
        <p className={cn("text-red-500 text-sm", errorClassName)}>{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-2")}>
      <div className={containerClasses}>
        {(labelPosition === "top" || labelPosition === "left") && labelElement}
        {switchElement}
        {(labelPosition === "bottom" || labelPosition === "right") && labelElement}
      </div>
      {error && <p className={cn("text-red-500 text-sm", errorClassName)}>{error}</p>}
    </div>
  );
};

export { Switch };
