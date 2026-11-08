"use client";

import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/interface/components/ui/table";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluída",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

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

export const TasksPage = () => {
  const { data: tasks, isLoading, isError, error } = apiClient.task.list.useQuery();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Minhas tarefas</h1>
        <p className="text-muted-foreground">Acompanhe o que está pendente.</p>
      </div>

      <Card>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANT[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
