"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";
import { FileUpload } from "@/interface/components/ui/file-upload";

export const FileUploadMultipleExample = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const utils = apiClient.useUtils();
  const uploadMultipleMutation = apiClient.upload.multiple.useMutation({
    onSuccess: () => {
      utils.upload.myUploads.invalidate();
      utils.upload.stats.invalidate();
    },
  });

  // Função para converter arquivo para base64
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Erro ao converter arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const filePromises = selectedFiles.map(async (file) => ({
        fileData: await convertFileToBase64(file),
        mimeType: file.type,
        fileName: file.name,
      }));

      const filesData = await Promise.all(filePromises);

      // Fazer upload via tRPC
      const result = await uploadMultipleMutation.mutateAsync({
        files: filesData,
        folder: "examples/multiple",
      });

      if (result.success) {
        toast.success(`${result.successCount} arquivo(s) enviado(s) com sucesso!`);
        if (result.errorCount > 0) {
          toast.error(`${result.errorCount} arquivo(s) falharam`);
        }
        setSelectedFiles([]);
      } else {
        toast.error("Erro ao enviar arquivos");
      }
    } catch (error) {
      console.error("Erro no upload múltiplo:", error);
      setUploadError("Erro ao processar arquivos");
      toast.error("Erro ao enviar arquivos");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <FileUpload
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={isUploading}
        error={uploadError || undefined}
        label="Upload múltiplo funcional"
        maxFiles={5}
        multiple
        onFilesChange={handleFileSelect}
        placeholder="Clique ou arraste múltiplos arquivos"
        value={selectedFiles}
      />
      {selectedFiles.length > 0 && (
        <Button className="w-full" disabled={isUploading} isLoading={isUploading} onClick={handleUpload}>
          {isUploading ? "Enviando..." : `Enviar ${selectedFiles.length} Arquivo(s)`}
        </Button>
      )}
    </div>
  );
};
