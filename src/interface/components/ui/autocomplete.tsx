"use client";

import { Check, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/interface/styles/utils";
import { Badge } from "./badge";

export interface Option {
  value: string;
  label: string;
}

type AutocompleteProps = {
  placeholder?: string;
  emptyText?: string;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  fetchOptions: (query: string) => Promise<Option[]>;
  debounceMs?: number;
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
  showInitialOptions?: boolean;
  initialOptions?: Option[];
  maxVisibleChips?: number;
  multiple?: boolean;
  containerClassName?: string;
  inputWrapperClassName?: string;
  inputClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  focusedOptionClassName?: string;
  chipClassName?: string;
  chipRemoveButtonClassName?: string;
  loadingClassName?: string;
  emptyClassName?: string;
  counterClassName?: string;
};

export const Autocomplete = ({
  placeholder = "Digite para buscar...",
  emptyText = "Nenhum item encontrado.",
  selectedValues,
  onSelectionChange,
  fetchOptions,
  debounceMs = 300,
  maxSelected,
  disabled = false,
  className,
  showInitialOptions = false,
  initialOptions,
  maxVisibleChips,
  multiple = true,
  containerClassName,
  inputWrapperClassName,
  inputClassName,
  menuClassName,
  optionClassName,
  selectedOptionClassName,
  focusedOptionClassName,
  chipClassName,
  chipRemoveButtonClassName,
  loadingClassName,
  emptyClassName,
}: AutocompleteProps) => {
  const [options, setOptions] = useState<Option[]>(initialOptions || []);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex] && dropdownRef.current) {
      const focusedElement = optionRefs.current[focusedIndex];
      const dropdown = dropdownRef.current;

      if (focusedElement) {
        const dropdownScrollTop = dropdown.scrollTop;
        const dropdownHeight = dropdown.clientHeight;
        const focusedOffsetTop = focusedElement.offsetTop;
        const focusedHeight = focusedElement.offsetHeight;

        if (focusedOffsetTop + focusedHeight > dropdownScrollTop + dropdownHeight) {
          dropdown.scrollTop = focusedOffsetTop + focusedHeight - dropdownHeight;
        } else if (focusedOffsetTop < dropdownScrollTop) {
          dropdown.scrollTop = focusedOffsetTop;
        }
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    const loadOptions = async () => {
      if (debouncedQuery.length === 0 && !showInitialOptions) {
        return;
      }

      setLoading(true);
      try {
        const results = await fetchOptions(debouncedQuery);
        setOptions(results);
        setFocusedIndex(-1);
        optionRefs.current = [];
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions().catch(console.error);
  }, [debouncedQuery, fetchOptions, showInitialOptions]);

  useEffect(() => {
    if (showInitialOptions && !initialOptions) {
      const loadInitialOptions = async () => {
        setLoading(true);
        try {
          const results = await fetchOptions("");
          setOptions(results);
        } catch (error) {
          console.error("Erro ao buscar opções iniciais:", error);
        } finally {
          setLoading(false);
        }
      };

      loadInitialOptions().catch(console.error);
    }
  }, [showInitialOptions, initialOptions, fetchOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setIsFocused(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptionsMap = useMemo(() => {
    const map = new Map<string, Option>();
    options.forEach((option) => {
      if (selectedValues.includes(option.value)) {
        map.set(option.value, option);
      }
    });
    return map;
  }, [options, selectedValues]);

  const selectedOption = useMemo(() => {
    if (!multiple && selectedValues.length > 0) {
      const firstValue = selectedValues[0];
      return firstValue ? selectedOptionsMap.get(firstValue) : null;
    }
    return null;
  }, [multiple, selectedValues, selectedOptionsMap]);

  const handleSelect = (value: string) => {
    if (multiple) {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else if (!maxSelected || selectedValues.length < maxSelected) {
        onSelectionChange([...selectedValues, value]);
      }
      setQuery("");
      setFocusedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
      setQuery("");
      setFocusedIndex(-1);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleRemove = (value: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (!multiple && selectedOption) {
      return;
    }
    if (showInitialOptions || query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setIsExpanded(false);
      }
    }, 200);
  };

  const handleContainerClick = () => {
    if (!disabled) {
      if (multiple) {
        setIsExpanded(true);
      }
      setIsFocused(true);
      inputRef.current?.focus();
      if (showInitialOptions) {
        setIsOpen(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && query === "" && selectedValues.length > 0) {
      if (multiple) {
        const lastValue = selectedValues[selectedValues.length - 1];
        if (lastValue) {
          handleRemove(lastValue);
        }
      } else {
        onSelectionChange([]);
      }
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" && (showInitialOptions || query.length > 0)) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev >= options.length - 1) {
            return 0;
          }
          return prev + 1;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev <= 0) {
            return options.length - 1;
          }
          return prev - 1;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          const selectedOption = options[focusedIndex];
          if (selectedOption) {
            handleSelect(selectedOption.value);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const isMaxReached = Boolean(maxSelected && selectedValues.length >= maxSelected);

  const inputValue = useMemo(() => {
    if (!multiple && selectedOption && !isFocused) {
      return selectedOption.label;
    }
    return query;
  }, [multiple, selectedOption, isFocused, query]);

  const inputPlaceholder = useMemo(() => {
    if (!multiple && selectedOption) {
      return "";
    }
    if (multiple && selectedValues.length > 0) {
      return "";
    }
    return placeholder;
  }, [multiple, selectedOption, selectedValues.length, placeholder]);

  useEffect(() => {
    if (!isFocused) {
      setIsExpanded(false);
    }
  }, [isFocused]);

  return (
    <div className={cn("relative w-full", className, containerClassName)} ref={containerRef}>
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-text",
          inputWrapperClassName
        )}
        onClick={handleContainerClick}
        ref={inputWrapperRef}
      >
        {multiple && (
          <>
            {selectedValues.map((value, index) => {
              const option = selectedOptionsMap.get(value);
              if (!option) return null;

              if (maxVisibleChips && !isExpanded) {
                if (index < maxVisibleChips) {
                  return (
                    <Badge
                      className={cn("flex h-6 items-center gap-1 px-2 text-xs", chipClassName)}
                      key={value}
                      variant="secondary"
                    >
                      {option.label}
                      <button
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          chipRemoveButtonClassName
                        )}
                        disabled={disabled}
                        onClick={(e) => handleRemove(value, e)}
                        type="button"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  );
                }
                if (index === maxVisibleChips && selectedValues.length > maxVisibleChips) {
                  const remainingCount = selectedValues.length - maxVisibleChips;
                  return (
                    <Badge
                      className={cn("flex h-6 items-center px-2 text-xs", chipClassName)}
                      key="more-count"
                      variant="outline"
                    >
                      +{remainingCount}
                    </Badge>
                  );
                }
                return null;
              }

              return (
                <Badge
                  className={cn("flex h-6 items-center gap-1 px-2 text-xs", chipClassName)}
                  key={value}
                  variant="secondary"
                >
                  {option.label}
                  <button
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      chipRemoveButtonClassName
                    )}
                    disabled={disabled}
                    onClick={(e) => handleRemove(value, e)}
                    type="button"
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}

            <input
              className={cn(
                "min-w-[4rem] flex-1 border-none bg-transparent p-0 outline-none focus:outline-none focus:ring-0",
                "placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed",
                inputClassName
              )}
              disabled={disabled || isMaxReached}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              ref={inputRef}
              type="text"
              value={inputValue}
            />
          </>
        )}

        {!multiple && (
          <div className="flex w-full items-center">
            <input
              className={cn(
                "flex-1 border-none bg-transparent p-0 outline-none focus:outline-none focus:ring-0",
                "placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed",
                inputClassName
              )}
              disabled={disabled}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              ref={inputRef}
              type="text"
              value={inputValue}
            />

            {selectedOption && (
              <button
                className={cn(
                  "ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  chipRemoveButtonClassName
                )}
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectionChange([]);
                }}
                type="button"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
            "max-h-60 overflow-auto",
            menuClassName
          )}
          ref={dropdownRef}
        >
          {loading ? (
            <div className={cn("px-3 py-2 text-muted-foreground text-sm", loadingClassName)}>Buscando...</div>
          ) : options.length === 0 ? (
            <div className={cn("px-3 py-2 text-muted-foreground text-sm", emptyClassName)}>{emptyText}</div>
          ) : (
            <div className="py-1">
              {options.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    className={cn(
                      "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      index === focusedIndex && "bg-accent text-accent-foreground",
                      isSelected && "bg-primary/10 font-medium text-primary",
                      optionClassName,
                      isSelected && selectedOptionClassName,
                      index === focusedIndex && focusedOptionClassName
                    )}
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
