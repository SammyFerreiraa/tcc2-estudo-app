import type { ICreateTask, IListTasks, IUpdateTask } from "@/common/schemas/task";
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
   * Lista as tarefas criadas pelo usuário informado, com filtros opcionais de status e prioridade
   */
  findManyByUser: async (userId: string, filters?: IListTasks) => {
    return await prisma.task.findMany({
      where: {
        createdById: userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
      },
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
