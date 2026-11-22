"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/interface/components/ui/card";

const DISPLAY_TIME_ZONE = "America/Sao_Paulo";

const formatWeekLabel = (weekStart: string) =>
  new Date(weekStart).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  });

export const WeeklyCreatedChart = () => {
  const { data, isLoading, isError, error } = apiClient.task.weeklyCreated.useQuery();

  const chartData = (data ?? []).map((week) => ({
    label: formatWeekLabel(week.weekStart),
    count: week.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas criadas por semana</CardTitle>
        <CardDescription>
          Últimas 8 semanas (segunda a domingo). A última barra é a semana atual; o rótulo é a segunda-feira da semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground text-sm">Carregando gráfico...</p>}

        {isError && <p className="text-destructive text-sm">{error.message}</p>}

        {data && (
          <div aria-label="Gráfico de tarefas criadas por semana" className="h-64 w-full" role="img">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} domain={[0, (max: number) => Math.max(max, 1)]} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  formatter={(value) => [value, "Tarefas criadas"]}
                  labelFormatter={(label) => `Semana de ${label}`}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Tarefas criadas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
