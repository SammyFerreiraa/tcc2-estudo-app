"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  createTaskSchema,
  type ICreateTask,
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityLabels,
  taskStatusLabels,
} from "@/common/schemas/task";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/card";
import { Button } from "@/interface/components/ui/button";
import { InputForm } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";

const defaultValues: ICreateTask = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
};

export const TasksPage = () => {
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
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso");
      reset(defaultValues);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl">Nova tarefa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <p className="text-center text-sm">
            <Link className="font-semibold text-foreground underline" href="/">
              Voltar ao início
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
