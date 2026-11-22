import { TRPCError } from "@trpc/server";
import { createTaskSchema, deleteTaskSchema, listTasksSchema, updateTaskSchema } from "@/common/schemas/task";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { taskRepository } from "./repository";

export const taskRouter = createTRPCRouter({
  create: procedures.protected.input(createTaskSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    }

    return await taskRepository.create(ctx.session.id, input);
  }),

  /**
   * Edita uma tarefa do usuário logado (nunca de outros usuários)
   */
  update: procedures.protected.input(updateTaskSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    }

    const task = await taskRepository.updateByIdAndUser(ctx.session.id, input);

    if (!task) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
    }

    return task;
  }),

  /**
   * Lista as tarefas do usuário logado (nunca de outros usuários), com filtros opcionais
   * de status e prioridade e busca por título ou descrição (combinados com E)
   */
  list: procedures.protected.input(listTasksSchema).query(async ({ ctx, input }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    return await taskRepository.findManyByUser(ctx.session.id, input);
  }),

  /**
   * Exclui uma tarefa do usuário logado
   */
  delete: procedures.protected.input(deleteTaskSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    }

    const task = await taskRepository.findOwnerById(input.id);

    if (!task) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada ou já foi excluída" });
    }

    if (task.createdById !== ctx.session.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para excluir esta tarefa" });
    }

    const deleted = await taskRepository.deleteByUser(input.id, ctx.session.id);

    if (deleted === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada ou já foi excluída" });
    }

    return { id: input.id };
  }),
});
