import { TRPCError } from "@trpc/server";
import { createTaskSchema, deleteTaskSchema } from "@/common/schemas/task";
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
   * Lista as tarefas do usuário logado (nunca de outros usuários)
   */
  list: procedures.protected.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    return await taskRepository.findManyByUser(ctx.session.id);
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
