"use client";

import { TASK_PRIORITIES, TASK_STATUSES, taskPriorityLabels, taskStatusLabels } from "@/common/schemas/task";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/interface/components/ui/card";

type DistributionCardProps = {
  title: string;
  items: { key: string; label: string; count: number }[];
};

const DistributionCard = ({ title, items }: DistributionCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {items.map((item) => (
          <li className="flex items-center justify-between" key={item.key}>
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-lg" data-testid={`count-${item.key}`}>
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const DashboardPage = () => {
  const { data, isLoading, isError, error } = apiClient.task.stats.useQuery();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas tarefas.</p>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Carregando dashboard...</p>}
      {isError && <p className="text-destructive text-sm">{error.message}</p>}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardDescription>Total de tarefas</CardDescription>
              <CardTitle className="text-4xl" data-testid="count-total">
                {data.total}
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <DistributionCard
              items={TASK_STATUSES.map((key) => ({ key, label: taskStatusLabels[key], count: data.status[key] }))}
              title="Por status"
            />
            <DistributionCard
              items={TASK_PRIORITIES.map((key) => ({
                key,
                label: taskPriorityLabels[key],
                count: data.priority[key],
              }))}
              title="Por prioridade"
            />
          </div>
        </>
      )}
    </div>
  );
};
