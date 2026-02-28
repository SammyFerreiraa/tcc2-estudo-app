import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { getSignedURL } from "@/server/external/storage/actions";
import { defaultBucket } from "@/server/external/storage/config";
import { uploadRepository } from "./repository";

export const uploadRouter = createTRPCRouter({
  /**
   * Teste público para verificar se o router está funcionando
   */
  ping: procedures.public.query(() => {
    return { message: "Upload router está funcionando", timestamp: new Date() };
  }),

  /**
   * Upload de arquivo único
   * Converte arquivo base64 para buffer e salva no storage
   */
  single: procedures.protected
    .input(
      z.object({
        fileData: z.string().min(1, "Dados do arquivo são obrigatórios"), // Base64
        mimeType: z.string().min(1, "Tipo de arquivo é obrigatório"),
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
        folder: z.string().optional().default("uploads"), // Pasta de destino no storage
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        // Converter base64 para buffer
        const fileBuffer = Buffer.from(input.fileData, "base64");

        // Gerar nome único do arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = input.fileName.split(".").pop() || "bin";
        const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;

        // Caminho completo no storage
        const gcsFileName = `${input.folder}/${uniqueFileName}`;

        // Upload no storage
        const file = defaultBucket.file(gcsFileName);
        await file.save(fileBuffer, {
          metadata: {
            contentType: input.mimeType,
            cacheControl: "public, max-age=31536000",
            metadata: {
              uploadedBy: session.id,
              originalFileName: input.fileName,
              uploadedAt: new Date().toISOString(),
            },
          },
        });

        // Gerar URL assinada para acesso
        const signedURL = await getSignedURL(gcsFileName);

        if (!signedURL) {
          throw new Error("Falha ao gerar URL assinada");
        }

        // Salvar registro do upload no banco de dados
        const uploadRecord = await uploadRepository.create({
          fileName: gcsFileName,
          originalName: input.fileName,
          mimeType: input.mimeType,
          size: fileBuffer.length,
          folder: input.folder,
          userId: session.id,
        });

        return {
          success: true,
          id: uploadRecord.id, // ID do registro no banco
          fileName: gcsFileName, // Nome do arquivo no storage
          originalName: input.fileName, // Nome original do arquivo
          url: signedURL, // URL assinada para acesso
          size: fileBuffer.length,
          mimeType: input.mimeType,
          uploadRecord, // Dados completos do banco
        };
      } catch (error) {
        console.error("Erro no upload:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno durante o upload do arquivo",
        });
      }
    }),

  /**
   * Upload de múltiplos arquivos
   * Processa lista de arquivos em base64 e faz upload de todos
   */
  multiple: procedures.protected
    .input(
      z.object({
        files: z
          .array(
            z.object({
              fileData: z.string().min(1, "Dados do arquivo são obrigatórios"),
              mimeType: z.string().min(1, "Tipo de arquivo é obrigatório"),
              fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
            })
          )
          .min(1, "Pelo menos um arquivo é obrigatório"),
        folder: z.string().optional().default("uploads"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const uploadResults: Array<{
          success: boolean;
          id: string;
          fileName: string;
          originalName: string;
          url: string;
          size: number;
          mimeType: string;
          uploadRecord: any;
        }> = [];
        const uploadErrors: Array<{
          fileName: string;
          error: string;
        }> = []; // Processar cada arquivo
        for (const [index, fileInput] of input.files.entries()) {
          try {
            // Converter base64 para buffer
            const fileBuffer = Buffer.from(fileInput.fileData, "base64");

            // Gerar nome único do arquivo
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileExtension = fileInput.fileName.split(".").pop() || "bin";
            const uniqueFileName = `${timestamp}-${randomId}-${index}.${fileExtension}`;

            // Caminho completo no storage
            const gcsFileName = `${input.folder}/${uniqueFileName}`;

            // Upload no storage
            const file = defaultBucket.file(gcsFileName);
            await file.save(fileBuffer, {
              metadata: {
                contentType: fileInput.mimeType,
                cacheControl: "public, max-age=31536000",
                metadata: {
                  uploadedBy: session.id,
                  originalFileName: fileInput.fileName,
                  uploadedAt: new Date().toISOString(),
                },
              },
            });

            // Gerar URL assinada para acesso
            const signedURL = await getSignedURL(gcsFileName);

            if (!signedURL) {
              throw new Error("Falha ao gerar URL assinada");
            }

            // Salvar registro do upload no banco de dados
            const uploadRecord = await uploadRepository.create({
              fileName: gcsFileName,
              originalName: fileInput.fileName,
              mimeType: fileInput.mimeType,
              size: fileBuffer.length,
              folder: input.folder,
              userId: session.id,
            });

            uploadResults.push({
              success: true,
              id: uploadRecord.id,
              fileName: gcsFileName,
              originalName: fileInput.fileName,
              url: signedURL,
              size: fileBuffer.length,
              mimeType: fileInput.mimeType,
              uploadRecord,
            });
          } catch (error) {
            console.error(`Erro no upload do arquivo ${fileInput.fileName}:`, error);
            uploadErrors.push({
              fileName: fileInput.fileName,
              error: "Erro durante o upload",
            });
          }
        }

        return {
          success: uploadResults.length > 0,
          uploads: uploadResults,
          errors: uploadErrors,
          totalFiles: input.files.length,
          successCount: uploadResults.length,
          errorCount: uploadErrors.length,
        };
      } catch (error) {
        console.error("Erro no upload múltiplo:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno durante o upload dos arquivos",
        });
      }
    }),

  /**
   * Deletar arquivo do storage
   * Remove arquivo baseado no nome do arquivo no storage
   */
  delete: procedures.protected
    .input(
      z.object({
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        // Buscar o upload no banco para verificar permissões
        const upload = await uploadRepository.findByFileName(input.fileName);

        if (!upload) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Upload não encontrado",
          });
        }

        // Verificar se é o dono do upload ou admin
        if (upload.userId !== session.id && session.role !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para deletar este arquivo",
          });
        }

        // Deletar do storage
        const file = defaultBucket.file(input.fileName);
        await file.delete();

        // Deletar do banco de dados
        await uploadRepository.deleteByFileName(input.fileName);

        return {
          success: true,
          message: "Arquivo deletado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao deletar arquivo",
        });
      }
    }),

  /**
   * Obter URL assinada para um arquivo
   * Gera URL temporária para acesso ao arquivo
   */
  getSignedUrl: procedures.protected
    .input(
      z.object({
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const signedURL = await getSignedURL(input.fileName);

        if (!signedURL) {
          throw new Error("Falha ao gerar URL assinada");
        }

        return {
          success: true,
          url: signedURL,
        };
      } catch (error) {
        console.error("Erro ao gerar URL assinada:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao gerar URL do arquivo",
        });
      }
    }),

  /**
   * Lista uploads do usuário atual
   * Com paginação e filtros
   */
  myUploads: procedures.protected
    .input(
      z.object({
        page: z.number().min(0).optional().default(0),
        limit: z.number().min(1).max(50).optional().default(10),
        folder: z.string().optional(),
        mimeType: z.string().optional(), // Prefixo do tipo MIME (ex: "image", "application/pdf")
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const result = await uploadRepository.findManyByUser({
          userId: session.id,
          page: input.page,
          limit: input.limit,
          folder: input.folder,
          mimeType: input.mimeType,
        });

        return result;
      } catch (error) {
        console.error("Erro ao buscar uploads:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao buscar uploads",
        });
      }
    }),

  /**
   * Lista todos os uploads (apenas admin)
   * Com paginação e filtros
   */
  list: procedures.protected
    .input(
      z.object({
        page: z.number().min(0).optional().default(0),
        limit: z.number().min(1).max(50).optional().default(10),
        search: z.string().optional(),
        folder: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      // Verificar se é admin (seguindo o padrão do example-upload)
      if (session.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Acesso restrito a administradores",
        });
      }

      try {
        const result = await uploadRepository.findMany({
          page: input.page,
          limit: input.limit,
          search: input.search,
          folder: input.folder,
          mimeType: input.mimeType,
        });

        return result;
      } catch (error) {
        console.error("Erro ao buscar todos os uploads:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao buscar uploads",
        });
      }
    }),

  /**
   * Busca upload por ID
   */
  getById: procedures.protected
    .input(
      z.object({
        id: z.string().uuid("ID inválido"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const upload = await uploadRepository.findById(input.id);

        if (!upload) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Upload não encontrado",
          });
        }

        // Verificar se é o dono do upload ou admin
        if (upload.userId !== session.id && session.role !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado a este upload",
          });
        }

        // Gerar URL assinada para acesso
        const signedURL = await getSignedURL(upload.fileName);

        return {
          ...upload,
          url: signedURL,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao buscar upload:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao buscar upload",
        });
      }
    }),

  /**
   * Estatísticas do usuário
   */
  stats: procedures.protected.query(async ({ ctx }) => {
    const { session } = ctx;

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    try {
      const [totalUploads, totalSize] = await Promise.all([
        uploadRepository.countByUser(session.id),
        uploadRepository.getTotalSizeByUser(session.id),
      ]);

      return {
        totalUploads,
        totalSize,
        totalSizeFormatted: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno ao buscar estatísticas",
      });
    }
  }),
});
