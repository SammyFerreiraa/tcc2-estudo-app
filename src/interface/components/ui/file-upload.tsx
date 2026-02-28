"use client";

import { File, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../../styles/utils";
import { Button } from "./button";
import { Input } from "./input";

export interface FileUploadProps {
  className?: string;
  label?: string;
  error?: string;
  multiple?: boolean;
  disabled?: boolean;
  value?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  placeholder?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
};

const isValidFileType = (file: File, accept?: string): boolean => {
  if (!accept) return true;
  const acceptedTypes = accept.split(",").map((type) => type.trim());
  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    if (type.includes("*")) {
      const baseType = type.split("/")[0];
      return file.type?.startsWith(baseType || "");
    }
    return file.type === type;
  });
};

const FileUpload = ({
  className,
  label,
  error,
  multiple = false,
  disabled = false,
  value = [],
  onFilesChange,
  accept,
  maxSize,
  maxFiles,
  placeholder = "Clique para selecionar ou arraste arquivos aqui",
  ...props
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      let validFiles = fileArray;

      // Validate file types
      if (accept) {
        validFiles = validFiles.filter((file) => isValidFileType(file, accept));
      }

      // Validate file sizes
      if (maxSize) {
        validFiles = validFiles.filter((file) => file.size <= maxSize);
      }

      // Respect multiple and maxFiles settings
      if (!multiple) {
        validFiles = validFiles.slice(0, 1);
      } else if (maxFiles) {
        const currentCount = value.length;
        const remainingSlots = maxFiles - currentCount;
        validFiles = validFiles.slice(0, remainingSlots);
      }

      // Update files
      const newFiles = multiple ? [...value, ...validFiles] : validFiles;
      onFilesChange?.(newFiles);
    },
    [accept, maxSize, multiple, maxFiles, value, onFilesChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onFilesChange?.(newFiles);
    },
    [value, onFilesChange]
  );

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          className={cn(
            "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error && "text-destructive"
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative rounded-lg border-2 border-muted-foreground/25 border-dashed p-6 text-center transition-colors",
          "hover:border-muted-foreground/50 hover:bg-muted/25",
          isDragOver && "border-primary bg-primary/5",
          error && "border-destructive",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
        onClick={openFileDialog}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Input
          accept={accept}
          className="sr-only"
          disabled={disabled}
          multiple={multiple}
          onChange={handleInputChange}
          type="file"
          {...props}
        />

        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium text-sm">{placeholder}</p>
            <p className="text-muted-foreground text-xs">
              {accept && `Tipos aceitos: ${accept}`}
              {maxSize && ` • Tamanho máximo: ${formatFileSize(maxSize)}`}
              {maxFiles && ` • Máximo ${maxFiles} arquivo${maxFiles > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              className={cn("flex items-center space-x-3 rounded-lg border p-3", error && "border-destructive")}
              key={`${file.name}-${index}`}
            >
              <File className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{file.name}</p>
                <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <Button
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="font-medium text-destructive text-sm">{error}</p>}
    </div>
  );
};

FileUpload.displayName = "FileUpload";

export { FileUpload };
