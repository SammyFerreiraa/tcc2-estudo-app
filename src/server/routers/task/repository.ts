import type { ICreateTask, IUpdateTask } from "@/common/schemas/task";
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
   * Atualiza a tarefa apenas se ela pertencer ao usuário informado.
   * Retorna a tarefa atualizada ou null se não existir / não for do usuário.
   */
  updateByIdAndUser: async (userId: string, data: IUpdateTask) => {
    const { count } = await prisma.task.updateMany({
      where: { id: data.id, createdById: userId },
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
      },
    });

    if (count === 0) {
      return null;
    }

    return await prisma.task.findFirst({
      where: { id: data.id, createdById: userId },
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
        description: true,
        status: true,
        priority: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
