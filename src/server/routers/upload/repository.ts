import { prisma } from "@/server/config/prisma";

export const uploadRepository = {
  /**
   * Cria um registro de upload no banco de dados
   */
  create: async (data: {
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    folder: string;
    userId: string;
  }) => {
    return await prisma.upload.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Lista uploads do usuário com paginação
   */
  findManyByUser: async (params: {
    userId: string;
    page?: number;
    limit?: number;
    folder?: string;
    mimeType?: string;
  }) => {
    const { userId, page = 0, limit = 10, folder, mimeType } = params;
    const offset = page * limit;

    const where = {
      userId,
      ...(folder && { folder: { contains: folder } }),
      ...(mimeType && { mimeType: { startsWith: mimeType } }),
    };

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.upload.count({ where }),
    ]);

    return {
      uploads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 0,
      },
    };
  },

  /**
   * Busca upload por ID
   */
  findById: async (id: string) => {
    return await prisma.upload.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Busca upload por fileName (path no storage)
   */
  findByFileName: async (fileName: string) => {
    return await prisma.upload.findFirst({
      where: { fileName },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Lista todos os uploads (apenas admin)
   */
  findMany: async (params: { page?: number; limit?: number; search?: string; folder?: string; mimeType?: string }) => {
    const { page = 0, limit = 10, search, folder, mimeType } = params;
    const offset = page * limit;

    const where = {
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: "insensitive" as const } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
      ...(folder && { folder: { contains: folder } }),
      ...(mimeType && { mimeType: { startsWith: mimeType } }),
    };

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.upload.count({ where }),
    ]);

    return {
      uploads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 0,
      },
    };
  },

  /**
   * Atualiza informações do upload
   */
  update: async (
    id: string,
    data: Partial<{
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      folder: string;
    }>
  ) => {
    return await prisma.upload.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Remove upload do banco de dados
   */
  delete: async (id: string) => {
    return await prisma.upload.delete({
      where: { id },
    });
  },

  /**
   * Remove upload por fileName
   */
  deleteByFileName: async (fileName: string) => {
    return await prisma.upload.deleteMany({
      where: { fileName },
    });
  },

  /**
   * Conta uploads por usuário
   */
  countByUser: async (userId: string) => {
    return await prisma.upload.count({
      where: { userId },
    });
  },

  /**
   * Calcula o tamanho total de uploads por usuário
   */
  getTotalSizeByUser: async (userId: string) => {
    const result = await prisma.upload.aggregate({
      where: { userId },
      _sum: {
        size: true,
      },
    });

    return result._sum.size || 0;
  },

  /**
   * Lista uploads por tipo de arquivo
   */
  findByMimeType: async (mimeTypePrefix: string, userId?: string) => {
    return await prisma.upload.findMany({
      where: {
        mimeType: { startsWith: mimeTypePrefix },
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
