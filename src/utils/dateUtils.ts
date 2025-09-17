export function toISODateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function isBusinessDay(d: Date, holidays: string[]): boolean {
  const dow: number = d.getUTCDay();
  return dow !== 0 && dow !== 6 && !holidays.includes(toISODateString(d));
}

export function goBackToNearestBusinessDay(d: Date, holidays: string[], A_END: number): void {
  while (!isBusinessDay(d, holidays)) {
    d.setUTCDate(d.getUTCDate() - 1);
    d.setUTCHours(A_END, 0, 0, 0);
  }
}

export function normalizeHourBackward(
  d: Date,
  holidays: string[],
  A_END: number,
  M_END: number,
  A_START: number,
  M_START: number
): void {
  goBackToNearestBusinessDay(d, holidays, A_END);
  const h: number = d.getUTCHours();
  if (h >= A_END) {
    d.setUTCHours(A_END, 0, 0, 0);
  } else if (h >= M_END && h < A_START) {
    d.setUTCHours(M_END, 0, 0, 0);
  } else if (h < M_START) {
    d.setUTCDate(d.getUTCDate() - 1);
    goBackToNearestBusinessDay(d, holidays, A_END);
    d.setUTCHours(A_END, 0, 0, 0);
  }
}

export function advanceToNextBusinessDay(d: Date, holidays: string[], M_START: number): void {
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (!isBusinessDay(d, holidays));
  d.setUTCHours(M_START, 0, 0, 0);
}

export function normalizeHourForward(
  d: Date,
  holidays: string[],
  M_START: number,
  M_END: number,
  A_START: number,
  A_END: number
): void {
  if (!isBusinessDay(d, holidays)) {
    advanceToNextBusinessDay(d, holidays, M_START);
    return;
  }
  const h: number = d.getUTCHours();
  if (h < M_START) {
    d.setUTCHours(M_START, 0, 0, 0);
  } else if (h >= M_END && h < A_START) {
    d.setUTCHours(A_START, 0, 0, 0);
  } else if (h >= A_END) {
    advanceToNextBusinessDay(d, holidays, M_START);
  }
}
