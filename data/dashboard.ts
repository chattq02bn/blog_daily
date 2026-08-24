export interface DayVisit {
  day: number;
  visits: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Số giả lập deterministic (không dùng Math.random để tránh lệch hydration) */
function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Lượt truy cập từng ngày của một tháng (month: 0-11) */
export function getMonthlyVisits(month: number): DayVisit[] {
  const days = DAYS_IN_MONTH[month] ?? 30;
  const base = 800 + month * 60; // xu hướng tăng dần về cuối năm
  const weekendBoost = 1.25;

  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const weekday = (day + month * 2) % 7;
    const noise = pseudo(month * 100 + day);
    const visits = Math.round(
      base * (weekday === 5 || weekday === 6 ? weekendBoost : 1) + noise * 400
    );
    return { day, visits };
  });
}

export function sumVisits(data: DayVisit[]): number {
  return data.reduce((sum, d) => sum + d.visits, 0);
}

export function peakDay(data: DayVisit[]): DayVisit {
  return data.reduce((max, d) => (d.visits > max.visits ? d : max), data[0]);
}
