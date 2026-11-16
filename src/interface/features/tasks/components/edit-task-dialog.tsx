"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  type IUpdateTask,
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityLabels,
  taskStatusLabels,
  updateTaskSchema,
} from "@/common/schemas/task";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";
import { Dialog } from "@/interface/components/ui/dialog";
import { InputForm } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";

type EditTaskDialogProps = {
  task: IUpdateTask | null;
  onClose: () => void;
};

export const EditTaskDialog = ({ task, onClose }: EditTaskDialogProps) => {
  const utils = apiClient.useUtils();

  const {
    formState: { errors },
    control,
    handleSubmit,
    register,
    reset,
  } = useForm<IUpdateTask>({
    resolver: zodResolver(updateTaskSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (task) {
      reset(task);
    }
  }, [task, reset]);

  const { mutate, isPending } = apiClient.task.update.useMutation({
    onSuccess: async () => {
      toast.success("Tarefa atualizada com sucesso");
      await utils.task.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submit = (data: IUpdateTask) => {
    mutate(data);
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={task !== null}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Editar tarefa</Dialog.Title>
          <Dialog.Description>Atualize título, descrição, status e prioridade.</Dialog.Description>
        </Dialog.Header>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <InputForm control={control} error={errors.title?.message} label="Título" name="title" />

          <div className="flex flex-col gap-3">
            <label className="font-semibold text-sm" htmlFor="edit-description">
              Descrição
            </label>
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              id="edit-description"
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

          <Dialog.Footer>
            <Button isLoading={isPending} type="submit">
              Salvar alterações
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
