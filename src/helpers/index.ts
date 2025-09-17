import {
  addHours as addHoursFns,
  addDays as addDaysFns,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  getDay,
} from "date-fns";

import { format } from "date-fns-tz";
import {
  LUNCH_END_HOUR,
  LUNCH_START_HOUR,
  TIMEZONE,
  WORK_END_HOUR,
  WORK_START_HOUR,
} from "../constants";

/**
 * Verifica si una fecha cae en fin de semana (sábado o domingo).
 * @param date La fecha a verificar.
 * @returns `true` si es fin de semana, `false` en caso contrario.
 */
export const isWeekend = (date: Date): boolean => {
  const day = getDay(date); // 0 = Domingo, 6 = Sábado
  return day === 0 || day === 6;
};

/**
 * Verifica si una fecha es un día festivo.
 * @param date La fecha a verificar.
 * @param holidays El Set de festivos.
 * @returns `true` si es festivo, `false` en caso contrario.
 */
export const isHoliday = (date: Date, holidays: Set<string>): boolean => {
  const formattedDate = format(date, "yyyy-MM-dd", { timeZone: TIMEZONE });
  return holidays.has(formattedDate);
};

/**
 * Verifica si una fecha es un día no hábil (fin de semana o festivo).
 * @param date La fecha a verificar.
 * @param holidays El Set de festivos.
 * @returns `true` si no es un día hábil.
 */
export const isNonWorkingDay = (date: Date, holidays: Set<string>): boolean => {
  return isWeekend(date) || isHoliday(date, holidays);
};

/**
 * Ajusta la fecha al siguiente momento hábil disponible.
 * Si la fecha está fuera del horario laboral o en un día no hábil,
 * la mueve hacia adelante hasta encontrar el próximo slot válido.
 * @param date La fecha a ajustar (en zona horaria de Colombia).
 * @param holidays El Set de festivos.
 * @returns La fecha ajustada al próximo momento hábil.
 */
export const adjustToNextWorkingMoment = (
  date: Date,
  holidays: Set<string>
): Date => {
  let adjustedDate = date;

  // Si es un día no hábil, mover al siguiente día hábil a las 8:00 a.m.
  while (isNonWorkingDay(adjustedDate, holidays)) {
    adjustedDate = addDaysFns(adjustedDate, 1);
    adjustedDate = setHours(adjustedDate, WORK_START_HOUR);
    adjustedDate = setMinutes(adjustedDate, 0);
    adjustedDate = setSeconds(adjustedDate, 0);
  }

  const hour = adjustedDate.getHours();

  // Si es antes del inicio de la jornada, ajustar a las 8:00 a.m.
  if (hour < WORK_START_HOUR) {
    adjustedDate = setHours(adjustedDate, WORK_START_HOUR);
    adjustedDate = setMinutes(adjustedDate, 0);
  }
  // Si es durante el almuerzo, ajustar al final del almuerzo (1:00 p.m.)
  else if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
    adjustedDate = setHours(adjustedDate, LUNCH_END_HOUR);
    adjustedDate = setMinutes(adjustedDate, 0);
  }
  // Si es después del fin de la jornada, mover al siguiente día hábil a las 8:00 a.m.
  else if (hour >= WORK_END_HOUR) {
    adjustedDate = addDaysFns(adjustedDate, 1);
    adjustedDate = setHours(adjustedDate, WORK_START_HOUR);
    adjustedDate = setMinutes(adjustedDate, 0);
    // Re-evaluar por si el siguiente día es no hábil
    return adjustToNextWorkingMoment(adjustedDate, holidays);
  }

  return setSeconds(setMilliseconds(adjustedDate, 0), 0); // Limpiar segundos y milisegundos
};
