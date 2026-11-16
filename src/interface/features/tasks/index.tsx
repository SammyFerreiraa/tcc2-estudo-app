"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  createTaskSchema,
  type ICreateTask,
  type IUpdateTask,
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityLabels,
  taskStatusLabels,
} from "@/common/schemas/task";
import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { InputForm } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/interface/components/ui/table";
import { EditTaskDialog } from "./components/edit-task-dialog";

type TaskStatus = (typeof TASK_STATUSES)[number];
type TaskPriority = (typeof TASK_PRIORITIES)[number];

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "outline"> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

const PRIORITY_VARIANT: Record<TaskPriority, "destructive" | "secondary" | "outline"> = {
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

const defaultValues: ICreateTask = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
};

const CreateTaskForm = () => {
  const utils = apiClient.useUtils();

  const {
    formState: { isSubmitting, errors },
    control,
    handleSubmit,
    register,
    reset,
  } = useForm<ICreateTask>({
    resolver: zodResolver(createTaskSchema),
    mode: "onChange",
    defaultValues,
  });

  const { mutateAsync } = apiClient.task.create.useMutation({
    onSuccess: async () => {
      toast.success("Tarefa criada com sucesso");
      reset(defaultValues);
      await utils.task.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submit = async (data: ICreateTask) => {
    try {
      await mutateAsync(data);
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova tarefa</CardTitle>
        <CardDescription>Informe título, descrição, status e prioridade.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <InputForm control={control} error={errors.title?.message} label="Título" name="title" />

          <div className="flex flex-col gap-3">
            <label className="font-semibold text-sm" htmlFor="description">
              Descrição
            </label>
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              id="description"
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectWithLabel
                error={errors.status?.message}
                label="Status"
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {taskStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectWithLabel>
            )}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <SelectWithLabel
                error={errors.priority?.message}
                label="Prioridade"
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {taskPriorityLabels[priority]}
                  </SelectItem>
                ))}
              </SelectWithLabel>
            )}
          />

          <Button className="w-full" isLoading={isSubmitting} type="submit">
            Criar tarefa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TaskList = () => {
  const { data: tasks, isLoading, isError, error } = apiClient.task.list.useQuery();
  const [editingTask, setEditingTask] = useState<IUpdateTask | null>(null);

  return (
    <Card>
      <EditTaskDialog onClose={() => setEditingTask(null)} task={editingTask} />
      <CardHeader>
        <CardTitle>Lista de tarefas</CardTitle>
        <CardDescription>Título, status e prioridade de cada tarefa.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground text-sm">Carregando tarefas...</p>}

        {isError && <p className="text-destructive text-sm">{error.message}</p>}

        {tasks && tasks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">Você ainda não possui tarefas.</p>
        )}

        {tasks && tasks.length > 0 && (
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[task.status]}>{taskStatusLabels[task.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        setEditingTask({
                          id: task.id,
                          title: task.title,
                          description: task.description ?? "",
                          status: task.status,
                          priority: task.priority,
                        })
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
      </CardContent>
    </Card>
  );
};

export const TasksPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Minhas tarefas</h1>
        <p className="text-muted-foreground">Crie novas tarefas e acompanhe o que está pendente.</p>
      </div>

      <CreateTaskForm />
      <TaskList />
    </div>
  );
};
