export const WEEKS_COUNT = 8;

// Fuso de referência das semanas (America/Sao_Paulo, UTC-3, sem horário de verão desde 2019).
const TZ_OFFSET_MS = -3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type WeeklyBucket = {
  /** Início da semana (segunda 00:00 no fuso de referência), como instante UTC */
  start: Date;
  /** Fim exclusivo da semana (próxima segunda 00:00 no fuso de referência) */
  end: Date;
};

/**
 * Retorna o instante UTC da segunda-feira 00:00 (fuso de referência) da semana que contém `date`.
 */
const startOfWeek = (date: Date): Date => {
  const local = new Date(date.getTime() + TZ_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const localMondayMidnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - daysSinceMonday
  );
  return new Date(localMondayMidnight - TZ_OFFSET_MS);
};

/**
 * Gera as últimas `WEEKS_COUNT` semanas (segunda a domingo), da mais antiga para a atual.
 * A última posição é sempre a semana que contém `now`.
 */
export const getLastWeeks = (now: Date = new Date()): WeeklyBucket[] => {
  const currentStart = startOfWeek(now).getTime();

  return Array.from({ length: WEEKS_COUNT }, (_, index) => {
    const start = currentStart - (WEEKS_COUNT - 1 - index) * WEEK_MS;
    return { start: new Date(start), end: new Date(start + WEEK_MS) };
  });
};

/**
 * Conta quantas datas caem em cada semana. Semanas sem datas ficam com 0.
 */
export const countByWeek = (weeks: WeeklyBucket[], dates: Date[]): number[] => {
  const counts = weeks.map(() => 0);

  for (const date of dates) {
    const time = date.getTime();
    const index = weeks.findIndex((week) => time >= week.start.getTime() && time < week.end.getTime());
    if (index !== -1) {
      counts[index] = (counts[index] ?? 0) + 1;
    }
  }

  return counts;
};
