import type { ICreateTask } from "@/common/schemas/task";
import { prisma } from "@/server/config/prisma";

export const taskRepository = {
  create: async (userId: string, data: ICreateTask) => {
    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        createdById: userId,
      },
    });
  },

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

  findOwnerById: async (id: string) => {
    return await prisma.task.findUnique({ where: { id }, select: { createdById: true } });
  },

  /**
   * Exclui a tarefa apenas se pertencer ao usuário. Retorna quantas linhas foram removidas.
   */
  deleteByUser: async (id: string, userId: string) => {
    const { count } = await prisma.task.deleteMany({ where: { id, createdById: userId } });
    return count;
  },
};
