import dayjs, { Dayjs } from "dayjs";

// ✅ Convierte una fecha a string ISO (solo fecha, sin hora)
export function toISODateString(d: Date | Dayjs): string {
  return dayjs(d).format("YYYY-MM-DD");
}

// ✅ Determina si una fecha es día hábil (no sábado, no domingo, no festivo)
export function isBusinessDay(d: Date | Dayjs, holidays: string[]): boolean {
  const date = dayjs(d); // 🔥 aseguramos consistencia
  const dow = date.day();
  return dow !== 0 && dow !== 6 && !holidays.includes(toISODateString(date));
}

// ✅ Retrocede hasta el día hábil más cercano (usado para normalizar fechas fuera de bloque)
export function goBackToNearestBusinessDay(
  d: Date | Dayjs,
  holidays: string[],
  A_END: number
): Dayjs {
  let date = dayjs(d);
  while (!isBusinessDay(date, holidays)) {
    date = date
      .subtract(1, "day")
      .hour(A_END)
      .minute(0)
      .second(0)
      .millisecond(0);
  }
  return date;
}

// ✅ Normaliza la hora hacia atrás al último bloque hábil disponible
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
    // 🔥 si pasa la hora de fin de la tarde → ajustar al final de la tarde
    date = date.hour(A_END).minute(0).second(0).millisecond(0);
  } else if (h >= M_END && h < A_START) {
    // 🔥 si está en la franja muerta entre mañana y tarde → mover al fin de la mañana
    date = date.hour(M_END).minute(0).second(0).millisecond(0);
  } else if (h < M_START) {
    // 🔥 si es muy temprano → retroceder un día al final de la tarde anterior
    date = goBackToNearestBusinessDay(date.subtract(1, "day"), holidays, A_END);
    date = date.hour(A_END).minute(0).second(0).millisecond(0);
  }

  return date;
}

// ✅ Avanza al siguiente día hábil y lo normaliza al inicio del bloque de la mañana
export function advanceToNextBusinessDay(
  d: Date | Dayjs,
  holidays: string[],
  M_START: number
): Dayjs {
  let date = dayjs(d);
  do {
    date = date.add(1, "day");
  } while (!isBusinessDay(date, holidays));

  return date.hour(M_START).minute(0).second(0).millisecond(0);
}

// ✅ Normaliza la hora hacia adelante al siguiente bloque hábil disponible
export function normalizeHourForward(
  d: Date | Dayjs,
  holidays: string[],
  M_START: number,
  M_END: number,
  A_START: number,
  A_END: number
): Dayjs {
  let date = dayjs(d);

  if (!isBusinessDay(date, holidays)) {
    // 🔥 si no es día hábil → siguiente día hábil al inicio de la mañana
    return advanceToNextBusinessDay(date, holidays, M_START);
  }

  const h = date.hour();

  if (h < M_START) {
    // 🔥 antes de la mañana → mover al inicio de la mañana
    date = date.hour(M_START).minute(0).second(0).millisecond(0);
  } else if (h >= M_END && h < A_START) {
    // 🔥 en la franja muerta entre mañana y tarde → mover al inicio de la tarde
    date = date.hour(A_START).minute(0).second(0).millisecond(0);
  } else if (h >= A_END) {
    // 🔥 después de la tarde → saltar al próximo día hábil
    date = advanceToNextBusinessDay(date, holidays, M_START);
  }

  return date;
}
