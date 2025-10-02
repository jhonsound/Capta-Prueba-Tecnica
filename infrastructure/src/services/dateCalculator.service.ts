import { A_END, A_START, M_END, M_START, TIMEZONE } from "../constants";
import { CalculationParams } from "../types";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import {
  isBusinessDay,
  normalizeHourBackward,
  normalizeHourForward,
  advanceToNextBusinessDay,
} from "../utils/dateUtils";

export function calculateBusinessDate({
  startDate,
  days = 0,
  hours = 0,
  holidays = [],
}: CalculationParams): string {
  // 1. Convertir la fecha inicial a objeto dayjs en el timezone de Bogotá
 /*  let date: Dayjs = dayjs.tz(startDate, TIMEZONE); */
  let date: Dayjs = dayjs.utc(startDate).tz(TIMEZONE, true);

  // 2. Si la fecha inicial no es hábil o está fuera de bloque, normalizar hacia atrás
  const initialHour: number = date.hour();
  if (
    !isBusinessDay(date, holidays) ||
    initialHour < M_START ||
    (initialHour >= M_END && initialHour < A_START) ||
    initialHour >= A_END
  ) {
    date = normalizeHourBackward(
      date,
      holidays,
      A_END,
      M_END,
      A_START,
      M_START
    );
  }

  // 3. Sumar días hábiles
  let addedDays: number = 0;
  while (addedDays < days) {
    date = date.add(1, "day");
    if (isBusinessDay(date, holidays)) {
      addedDays++;
    }
  }

  // 4. Si hay horas a sumar, normalizar hacia adelante al siguiente bloque hábil
  if (hours > 0) {
    date = normalizeHourForward(date, holidays, M_START, M_END, A_START, A_END);
  }

  // 5. Sumar minutos hábiles
  let remainingMinutes: number = hours * 60;
  while (remainingMinutes > 0) {
    if (!isBusinessDay(date, holidays)) {
      date = advanceToNextBusinessDay(date, holidays, M_START);
      continue;
    }

    const h: number = date.hour();
    let blockEnd: Dayjs | null = null;

    if (h >= M_START && h < M_END) {
      blockEnd = date.hour(M_END).minute(0).second(0).millisecond(0);
    } else if (h >= A_START && h < A_END) {
      blockEnd = date.hour(A_END).minute(0).second(0).millisecond(0);
    } else {
      date = normalizeHourForward(
        date,
        holidays,
        M_START,
        M_END,
        A_START,
        A_END
      );
      continue;
    }

    const availableMinutes: number = blockEnd.diff(date, "minute");

    if (remainingMinutes <= availableMinutes) {
      date = date.add(remainingMinutes, "minute");
      remainingMinutes = 0;

      if (date.hour() === M_END && date.minute() === 0) {
        date = date.hour(A_START).minute(0).second(0).millisecond(0);
      }
    } else {
      date = blockEnd;
      remainingMinutes -= availableMinutes;
      if (date.hour() === M_END) {
        date = date.hour(A_START).minute(0).second(0).millisecond(0);
      } else if (date.hour() === A_END) {
        date = advanceToNextBusinessDay(date, holidays, M_START);
      }
    }
  }

  // ✅ 6. Retornar la fecha en UTC
  return date.tz("UTC").format(); // <-- este es el cambio clave
}
