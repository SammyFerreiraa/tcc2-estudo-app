import { TRPCError } from "@trpc/server";
import { createTaskSchema, updateTaskSchema } from "@/common/schemas/task";
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
});
