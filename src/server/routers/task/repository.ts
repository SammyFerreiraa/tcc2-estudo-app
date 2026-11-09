import { prisma } from "@/server/config/prisma";

export const taskRepository = {
  /**
   * Lista todas as tarefas criadas pelo usuário informado
   */
  findManyByUser: async (userId: string) => {
    return await prisma.task.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
