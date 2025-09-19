import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc);

export function toISODateString(d: Date | Dayjs): string {
  return dayjs(d).utc().format('YYYY-MM-DD');
}

export function isBusinessDay(d: Date | Dayjs, holidays: string[]): boolean {
  const dow = dayjs(d).utc().day();
  return dow !== 0 && dow !== 6 && !holidays.includes(toISODateString(d));
}

export function goBackToNearestBusinessDay(d: Date | Dayjs, holidays: string[], A_END: number): Dayjs {
  let date = dayjs(d).utc();
  while (!isBusinessDay(date, holidays)) {
    date = date.subtract(1, 'day').hour(A_END).minute(0).second(0).millisecond(0);
  }
  return date;
}

export function normalizeHourBackward(
  d: Date | Dayjs,
  holidays: string[],
  A_END: number,
  M_END: number,
  A_START: number,
  M_START: number
): Dayjs {
  let date = goBackToNearestBusinessDay(d, holidays, A_END);
  const h = date.hour();
  if (h >= A_END) {
    date = date.hour(A_END).minute(0).second(0).millisecond(0);
  } else if (h >= M_END && h < A_START) {
    date = date.hour(M_END).minute(0).second(0).millisecond(0);
  } else if (h < M_START) {
    date = date.subtract(1, 'day');
    date = goBackToNearestBusinessDay(date, holidays, A_END);
    date = date.hour(A_END).minute(0).second(0).millisecond(0);
  }
  return date;
}

export function advanceToNextBusinessDay(
  d: Date | Dayjs,
  holidays: string[],
  M_START: number
): Dayjs {
  let date = dayjs(d).utc();
  do {
    date = date.add(1, 'day');
  } while (!isBusinessDay(date, holidays));
  date = date.hour(M_START).minute(0).second(0).millisecond(0);
  return date;
}

export function normalizeHourForward(
  d: Date | Dayjs,
  holidays: string[],
  M_START: number,
  M_END: number,
  A_START: number,
  A_END: number
): Dayjs {
  let date = dayjs(d).utc();
  if (!isBusinessDay(date, holidays)) {
    date = advanceToNextBusinessDay(date, holidays, M_START);
    return date;
  }
  const h = date.hour();
  if (h < M_START) {
    date = date.hour(M_START).minute(0).second(0).millisecond(0);
  } else if (h >= M_END && h < A_START) {
    date = date.hour(A_START).minute(0).second(0).millisecond(0);
  } else if (h >= A_END) {
    date = advanceToNextBusinessDay(date, holidays, M_START);
  }
  return date;
}

