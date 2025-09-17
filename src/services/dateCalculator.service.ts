import { A_END, A_START, M_END, M_START } from "../constants";
import { CalculationParams } from "../types";
import {
  isBusinessDay,
  normalizeHourBackward,
  normalizeHourForward,
  advanceToNextBusinessDay
} from "../utils/dateUtils";


export function calculateBusinessDate({
  startDate,
  days = 0,
  hours = 0,
  holidays = [],
}: CalculationParams): Date {
  // Create a new Date instance to avoid mutating the original object.
  let date: Date =
    startDate instanceof Date
      ? new Date(startDate.getTime())
      : new Date(startDate);

  /* console.log("holidays------->", holidays); */

  const initialHour: number = date.getUTCHours();
  if (
    !isBusinessDay(date, holidays) ||
    initialHour < M_START ||
    (initialHour >= M_END && initialHour < A_START) ||
    initialHour >= A_END
  ) {
    normalizeHourBackward(date, holidays, A_END, M_END, A_START, M_START);
  }

  let addedDays: number = 0;
  while (addedDays < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isBusinessDay(date, holidays)) {
      addedDays++;
    }
  }

  if (hours > 0) {
    normalizeHourForward(date, holidays, M_START, M_END, A_START, A_END);
  }

  let remainingMinutes: number = hours * 60;
  while (remainingMinutes > 0) {
    if (!isBusinessDay(date, holidays)) {
      advanceToNextBusinessDay(date, holidays, M_START);
      continue;
    }

    const h: number = date.getUTCHours();
    let blockEnd: Date | null = null;

    if (h >= M_START && h < M_END) {
      blockEnd = new Date(date);
      blockEnd.setUTCHours(M_END, 0, 0, 0);
    } else if (h >= A_START && h < A_END) {
      blockEnd = new Date(date);
      blockEnd.setUTCHours(A_END, 0, 0, 0);
    } else {
      normalizeHourForward(date, holidays, M_START, M_END, A_START, A_END);
      continue;
    }

    const availableMinutes: number = Math.floor(
      (blockEnd.getTime() - date.getTime()) / 60000
    );

    if (remainingMinutes <= availableMinutes) {
      date.setUTCMinutes(date.getUTCMinutes() + remainingMinutes);
      remainingMinutes = 0;
      if (date.getUTCHours() === M_END && date.getUTCMinutes() === 0) {
        date.setUTCHours(A_START, 0, 0, 0);
      }
    } else {
      date = new Date(blockEnd);
      remainingMinutes -= availableMinutes;
      if (date.getUTCHours() === M_END) {
        date.setUTCHours(A_START, 0, 0, 0);
      } else if (date.getUTCHours() === A_END) {
        advanceToNextBusinessDay(date, holidays, M_START);
      }
    }
  }

  return date;
}
