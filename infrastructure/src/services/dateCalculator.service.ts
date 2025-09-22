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
  advanceToNextBusinessDay
} from "../utils/dateUtils";



export function calculateBusinessDate({
  startDate,
  days = 0,
  hours = 0,
  holidays = [],
}: CalculationParams): Date {
  // 1. Convertir la fecha inicial a objeto dayjs en UTC
  let date: Dayjs = dayjs(startDate).tz(TIMEZONE);

  // 2. Si la fecha inicial no es hábil o está fuera de bloque, normalizar hacia atrás al último bloque hábil
  const initialHour: number = date.hour();
  if (
    !isBusinessDay(date, holidays) ||
    initialHour < M_START ||
    (initialHour >= M_END && initialHour < A_START) ||
    initialHour >= A_END
  ) {
    date = normalizeHourBackward(date, holidays, A_END, M_END, A_START, M_START);
  }

  // 3. Sumar días hábiles, avanzando solo si el día es hábil y respetando festivos
  let addedDays: number = 0;
  while (addedDays < days) {
    date = date.add(1, "day");
    if (isBusinessDay(date, holidays)) {
      addedDays++;
    }
  }

  // 4. Si hay horas a sumar, normalizar hacia adelante al siguiente bloque hábil si es necesario
  if (hours > 0) {
    date = normalizeHourForward(date, holidays, M_START, M_END, A_START, A_END);
  }

  // 5. Sumar minutos hábiles, avanzando entre bloques y días hábiles según corresponda
  let remainingMinutes: number = hours * 60;
  while (remainingMinutes > 0) {
    // Si no es día hábil, avanzar al siguiente día hábil y normalizar hora
    if (!isBusinessDay(date, holidays)) {
      date = advanceToNextBusinessDay(date, holidays, M_START);
      continue;
    }

    const h: number = date.hour();
    let blockEnd: Dayjs | null = null;

    // Determinar el bloque horario actual (mañana/tarde)
    if (h >= M_START && h < M_END) {
      blockEnd = date.hour(M_END).minute(0).second(0).millisecond(0);
    } else if (h >= A_START && h < A_END) {
      blockEnd = date.hour(A_END).minute(0).second(0).millisecond(0);
    } else {
      // Si está fuera de bloque, normalizar hacia adelante
      date = normalizeHourForward(date, holidays, M_START, M_END, A_START, A_END);
      continue;
    }

    // Calcular minutos disponibles en el bloque actual
    const availableMinutes: number = blockEnd.diff(date, "minute");

    if (remainingMinutes <= availableMinutes) {
      // Si los minutos caben en el bloque actual, sumar y terminar
      date = date.add(remainingMinutes, "minute");
      remainingMinutes = 0;
      // Si termina justo el bloque de mañana, saltar a la tarde
      if (date.hour() === M_END && date.minute() === 0) {
        date = date.hour(A_START).minute(0).second(0).millisecond(0);
      }
    } else {
      // Si los minutos exceden el bloque, avanzar al siguiente bloque/día hábil
      date = blockEnd;
      remainingMinutes -= availableMinutes;
      if (date.hour() === M_END) {
        // Saltar a la tarde
        date = date.hour(A_START).minute(0).second(0).millisecond(0);
      } else if (date.hour() === A_END) {
        // Saltar al siguiente día hábil por la mañana
        date = advanceToNextBusinessDay(date, holidays, M_START);
      }
    }
  }

  // 6. Retornar la fecha final calculada como objeto Date
  return date.tz('UTC', true).toDate();
}
