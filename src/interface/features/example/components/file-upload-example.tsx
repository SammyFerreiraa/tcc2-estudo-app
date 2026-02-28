"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";
import { FileUpload } from "@/interface/components/ui/file-upload";

export const FileUploadExample = () => {
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const utils = apiClient.useUtils();
  const uploadMutation = apiClient.upload.single.useMutation({
    onSuccess: () => {
      utils.upload.myUploads.invalidate();
      utils.upload.stats.invalidate();
    },
  });

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
    setSelectedFile(files);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFile.length === 0) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    const file = selectedFile[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Converter arquivo para base64
      const fileBase64 = await convertFileToBase64(file);

      // Fazer upload via tRPC
      const result = await uploadMutation.mutateAsync({
        fileData: fileBase64,
        mimeType: file.type,
        fileName: file.name,
        folder: "examples/single",
      });

      if (result.success) {
        toast.success(`${file.name} enviado com sucesso!`);
        setSelectedFile([]);
      } else {
        toast.error("Erro ao enviar arquivo");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError("Erro ao processar arquivo");
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <FileUpload
        accept="image/*"
        disabled={isUploading}
        error={uploadError || undefined}
        label="Upload único funcional"
        maxSize={5 * 1024 * 1024} // 5MB
        onFilesChange={handleFileSelect}
        placeholder="Clique ou arraste uma imagem"
        value={selectedFile}
      />
      {selectedFile.length > 0 && (
        <Button className="w-full" disabled={isUploading} isLoading={isUploading} onClick={handleUpload}>
          {isUploading ? "Enviando..." : "Enviar Arquivo"}
        </Button>
      )}
    </div>
  );
};
