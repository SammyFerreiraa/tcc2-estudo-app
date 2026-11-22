import {
  type ICreateTask,
  type IListTasks,
  type IUpdateTask,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/common/schemas/task";
import { prisma } from "@/server/config/prisma";
import { countByWeek, getLastWeeks } from "./weekly";

type TaskStatus = (typeof TASK_STATUSES)[number];
type TaskPriority = (typeof TASK_PRIORITIES)[number];

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
   * e busca por título ou descrição (sem diferenciar maiúsculas/minúsculas). Tudo combinado com E.
   */
  findManyByUser: async (userId: string, filters?: IListTasks) => {
    const term = filters?.search?.trim();

    return await prisma.task.findMany({
      where: {
        createdById: userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(term && {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        }),
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

  /**
   * Conta as tarefas do usuário por status e por prioridade. Categorias sem tarefas retornam 0.
   */
  countStatsByUser: async (userId: string) => {
    const [byStatus, byPriority] = await Promise.all([
      prisma.task.groupBy({ by: ["status"], where: { createdById: userId }, _count: { _all: true } }),
      prisma.task.groupBy({ by: ["priority"], where: { createdById: userId }, _count: { _all: true } }),
    ]);

    const status = Object.fromEntries(TASK_STATUSES.map((key) => [key, 0])) as Record<TaskStatus, number>;
    const priority = Object.fromEntries(TASK_PRIORITIES.map((key) => [key, 0])) as Record<TaskPriority, number>;

    for (const row of byStatus) status[row.status] = row._count._all;
    for (const row of byPriority) priority[row.priority] = row._count._all;

    const total = Object.values(status).reduce((sum, value) => sum + value, 0);

    return { total, status, priority };
  },

  /**
   * Conta as tarefas criadas pelo usuário em cada uma das últimas 8 semanas (segunda a domingo,
   * a última é a semana atual). Semanas sem tarefas retornam 0.
   */
  countCreatedPerWeek: async (userId: string, now: Date = new Date()) => {
    const weeks = getLastWeeks(now);
    const rangeStart = weeks[0]?.start;
    const rangeEnd = weeks.at(-1)?.end;

    const tasks = await prisma.task.findMany({
      where: { createdById: userId, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    });

    const counts = countByWeek(
      weeks,
      tasks.map((task) => task.createdAt)
    );

    return weeks.map((week, index) => ({
      weekStart: week.start.toISOString(),
      count: counts[index] ?? 0,
    }));
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
