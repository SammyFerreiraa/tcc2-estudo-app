"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { BaseInput, InputForm } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/interface/components/ui/table";
import { EditTaskDialog } from "./components/edit-task-dialog";
import { WeeklyCreatedChart } from "./components/weekly-created-chart";

type TaskStatus = (typeof TASK_STATUSES)[number];
type TaskPriority = (typeof TASK_PRIORITIES)[number];

const ALL_FILTER = "ALL";

type StatusFilter = TaskStatus | typeof ALL_FILTER;
type PriorityFilter = TaskPriority | typeof ALL_FILTER;

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
      await Promise.all([utils.task.list.invalidate(), utils.task.weeklyCreated.invalidate()]);
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

const SEARCH_DEBOUNCE_MS = 300;

const TaskList = () => {
  const utils = apiClient.useUtils();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_FILTER);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(ALL_FILTER);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<IUpdateTask | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {
    data: tasks,
    isLoading,
    isError,
    error,
  } = apiClient.task.list.useQuery(
    {
      status: statusFilter === ALL_FILTER ? undefined : statusFilter,
      priority: priorityFilter === ALL_FILTER ? undefined : priorityFilter,
      search: search || undefined,
    },
    { placeholderData: keepPreviousData }
  );

  const hasFilters = statusFilter !== ALL_FILTER || priorityFilter !== ALL_FILTER || search.length > 0;

  const deleteTask = apiClient.task.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso");
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSettled: async () => {
      await Promise.all([utils.task.list.invalidate(), utils.task.weeklyCreated.invalidate()]);
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Excluir a tarefa "${title}"?`)) return;
    deleteTask.mutate({ id });
  };

  const clearFilters = () => {
    setStatusFilter(ALL_FILTER);
    setPriorityFilter(ALL_FILTER);
    setSearchInput("");
    setSearch("");
  };

  return (
    <Card>
      <EditTaskDialog onClose={() => setEditingTask(null)} task={editingTask} />
      <CardHeader>
        <CardTitle>Lista de tarefas</CardTitle>
        <CardDescription>Título, status e prioridade de cada tarefa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BaseInput
          aria-label="Buscar tarefas"
          maxLength={150}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por título ou descrição"
          type="search"
          value={searchInput}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SelectWithLabel
            label="Filtrar por status"
            name="status-filter"
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            value={statusFilter}
            wrapperClassName="sm:w-48"
          >
            <SelectItem value={ALL_FILTER}>Todos</SelectItem>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {taskStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectWithLabel>

          <SelectWithLabel
            label="Filtrar por prioridade"
            name="priority-filter"
            onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
            value={priorityFilter}
            wrapperClassName="sm:w-48"
          >
            <SelectItem value={ALL_FILTER}>Todas</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </SelectItem>
            ))}
          </SelectWithLabel>

          <Button disabled={!hasFilters} onClick={clearFilters} type="button" variant="outline">
            Limpar filtros
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Carregando tarefas...</p>}

        {isError && <p className="text-destructive text-sm">{error.message}</p>}

        {tasks && tasks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {hasFilters
              ? "Nenhuma tarefa encontrada com os filtros e a busca informados."
              : "Você ainda não possui tarefas."}
          </p>
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
                    <div className="flex justify-end gap-2">
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
                      <Button
                        disabled={deleteTask.isPending && deleteTask.variables?.id === task.id}
                        onClick={() => handleDelete(task.id, task.title)}
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        Excluir
                      </Button>
                    </div>
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

      <WeeklyCreatedChart />
      <CreateTaskForm />
      <TaskList />
    </div>
  );
};
