import { z } from "@/config/zod-config";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export const taskStatusLabels = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluída",
} as const satisfies Record<(typeof TASK_STATUSES)[number], string>;

export const taskPriorityLabels = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
} as const satisfies Record<(typeof TASK_PRIORITIES)[number], string>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório").max(150, "Título muito longo"),
  description: z.string().trim().max(2000, "Descrição muito longa"),
  status: z.enum(TASK_STATUSES, { message: "Status inválido" }),
  priority: z.enum(TASK_PRIORITIES, { message: "Prioridade inválida" }),
});

export type ICreateTask = z.infer<typeof createTaskSchema>;

export const listTasksSchema = z.object({
  search: z.string().trim().max(150, "Termo de busca muito longo").optional(),
});

export type IListTasks = z.infer<typeof listTasksSchema>;

export const deleteTaskSchema = z.object({
  id: z.string().min(1, "Tarefa inválida"),
});

export type IDeleteTask = z.infer<typeof deleteTaskSchema>;

export const updateTaskSchema = createTaskSchema.extend({
  id: z.string().min(1, "Tarefa inválida"),
});

export type IUpdateTask = z.infer<typeof updateTaskSchema>;
