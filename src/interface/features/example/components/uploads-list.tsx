"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";

export const UploadsList = () => {
  const [page, setPage] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loadingViewFile, setLoadingViewFile] = useState<string | null>(null);

  const utils = apiClient.useUtils();

  // Buscar uploads do usuário
  const { data, isLoading } = apiClient.upload.myUploads.useQuery({
    page,
    limit: 5,
    mimeType: selectedType || undefined,
  });

  // Buscar estatísticas
  const { data: stats } = apiClient.upload.stats.useQuery();

  // Deletar upload
  const deleteMutation = apiClient.upload.delete.useMutation({
    onSuccess: () => {
      toast.success("Arquivo deletado com sucesso!");
      utils.upload.myUploads.invalidate();
      utils.upload.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar arquivo");
    },
  });

  const handleDelete = (fileName: string) => {
    if (confirm("Tem certeza que deseja deletar este arquivo?")) {
      deleteMutation.mutate({ fileName });
    }
  };

  const handleViewFile = async (uploadId: string, fileName: string) => {
    try {
      setLoadingViewFile(uploadId);
      toast.loading("Obtendo URL segura do arquivo...", { id: `view-${uploadId}` });

      // Buscar os dados do upload com URL assinada
      const uploadData = await utils.upload.getById.fetch({ id: uploadId });

      if (uploadData?.url) {
        // Abrir arquivo diretamente do GCP em nova aba
        window.open(uploadData.url, "_blank");
        toast.success("Arquivo aberto em nova aba", { id: `view-${uploadId}` });
      } else {
        toast.error("Não foi possível obter a URL do arquivo", { id: `view-${uploadId}` });
      }
    } catch (error) {
      console.error("Erro ao obter URL do arquivo:", error);
      toast.error("Erro ao acessar arquivo", { id: `view-${uploadId}` });
    } finally {
      setLoadingViewFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("doc")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "📊";
    return "📁";
  };

  // Componente de skeleton para loading
  const UploadSkeleton = () => (
    <div className="flex items-center justify-between p-3 border rounded-lg animate-pulse bg-gray-50/50">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gray-300 rounded-md"></div>
        <div className="space-y-2">
          <div className="w-40 h-4 bg-gray-300 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-14 h-8 bg-gray-200 rounded-md"></div>
        <div className="w-16 h-8 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Total de Uploads</p>
          {stats ? (
            <p className="text-lg font-semibold">{stats.totalUploads}</p>
          ) : (
            <div className="w-10 h-6 bg-gray-300 rounded animate-pulse"></div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600">Espaço Usado</p>
          {stats ? (
            <p className="text-lg font-semibold">{stats.totalSizeFormatted}</p>
          ) : (
            <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={selectedType === "" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedType("");
              setPage(0);
            }}
          >
            Todos
          </Button>
          <Button
            variant={selectedType === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedType("image");
              setPage(0);
            }}
          >
            Imagens
          </Button>
          <Button
            variant={selectedType === "application" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedType("application");
              setPage(0);
            }}
          >
            Documentos
          </Button>
        </div>
      </div>

      {/* Lista de uploads */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <UploadSkeleton key={`skeleton-${index}`} />)
        ) : data?.uploads && data.uploads.length > 0 ? (
          data.uploads.map((upload) => (
            <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getFileTypeIcon(upload.mimeType)}</span>
                <div>
                  <p className="font-medium text-sm">{upload.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.size)} • {new Date(upload.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewFile(upload.id, upload.originalName)}
                  disabled={loadingViewFile === upload.id}
                  isLoading={loadingViewFile === upload.id}
                  title="Abrir arquivo do Google Cloud Storage"
                >
                  {loadingViewFile === upload.id ? "Carregando..." : "Ver"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(upload.fileName)}
                  disabled={deleteMutation.isPending}
                >
                  Deletar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum upload encontrado</p>
            <p className="text-sm">Faça upload de alguns arquivos acima para vê-los aqui</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {isLoading ? (
        <div className="flex justify-between items-center">
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        data?.pagination &&
        data.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {page + 1} de {data.pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
          </div>
        )
      )}
    </div>
  );
};
