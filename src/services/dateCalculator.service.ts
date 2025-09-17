import { A_END, A_START, M_END, M_START } from "../constants";
import { CalculationParams } from "../types";

export function calculateBusinessDate({
  startDate,
  days = 0,
  hours = 0,
  holidays = [],
}: CalculationParams): Date {
  // Crea una nueva instancia de Date para no modificar el objeto original.
  let fecha: Date =
    startDate instanceof Date
      ? new Date(startDate.getTime())
      : new Date(startDate);

  // ----- CAMBIO 1: Se usa un array directamente en lugar de un Set -----
  const holidaysArray: string[] = holidays; // --- Constantes del Horario Laboral (en horas UTC) ---
  console.log("holidays------->", holidays);

  function toYYYYMMDD(d: Date): string {
    return d.toISOString().split("T")[0];
  } /** Verifica si una fecha corresponde a un día hábil (lunes a viernes y no festivo). */

  function esDiaHabil(d: Date): boolean {
    const dow: number = d.getUTCDay(); // 0:Domingo, 6:Sábado

    // ----- CAMBIO 2: Se reemplaza .has() por .includes() -----
    return dow !== 0 && dow !== 6 && !holidaysArray.includes(toYYYYMMDD(d));
  } /** Retrocede la fecha día por día hasta encontrar un día hábil. */

  function retrocederAlDiaHabilMasCercano(d: Date): void {
    while (!esDiaHabil(d)) {
      d.setUTCDate(d.getUTCDate() - 1);
      d.setUTCHours(A_END, 0, 0, 0); // Ajusta a la última hora hábil del día.
    }
  } /** Ajusta la hora de la fecha al momento hábil más cercano hacia atrás. */

  function normalizarHoraHaciaAtras(d: Date): void {
    retrocederAlDiaHabilMasCercano(d);
    const h: number = d.getUTCHours();
    if (h >= A_END) {
      d.setUTCHours(A_END, 0, 0, 0);
    } else if (h >= M_END && h < A_START) {
      d.setUTCHours(M_END, 0, 0, 0);
    } else if (h < M_START) {
      d.setUTCDate(d.getUTCDate() - 1);
      retrocederAlDiaHabilMasCercano(d);
      d.setUTCHours(A_END, 0, 0, 0);
    }
  } /** Avanza la fecha al inicio del próximo día hábil. */

  function avanzarAlProximoDiaHabil(d: Date): void {
    do {
      d.setUTCDate(d.getUTCDate() + 1);
    } while (!esDiaHabil(d));
    d.setUTCHours(M_START, 0, 0, 0);
  } /** Ajusta la hora de la fecha al próximo momento hábil hacia adelante. */

  function normalizarHoraHaciaAdelante(d: Date): void {
    if (!esDiaHabil(d)) {
      avanzarAlProximoDiaHabil(d);
      return;
    }
    const h: number = d.getUTCHours();
    if (h < M_START) {
      d.setUTCHours(M_START, 0, 0, 0);
    } else if (h >= M_END && h < A_START) {
      d.setUTCHours(A_START, 0, 0, 0);
    } else if (h >= A_END) {
      avanzarAlProximoDiaHabil(d);
    }
  } // --- Lógica Principal (sin cambios) ---

  const hInicial: number = fecha.getUTCHours();
  if (
    !esDiaHabil(fecha) ||
    hInicial < M_START ||
    (hInicial >= M_END && hInicial < A_START) ||
    hInicial >= A_END
  ) {
    normalizarHoraHaciaAtras(fecha);
  }

  let diasAgregados: number = 0;
  while (diasAgregados < days) {
    fecha.setUTCDate(fecha.getUTCDate() + 1);
    if (esDiaHabil(fecha)) {
      diasAgregados++;
    }
  }

  if (hours > 0) {
    normalizarHoraHaciaAdelante(fecha);
  }

  let minutosRestantes: number = hours * 60;
  while (minutosRestantes > 0) {
    if (!esDiaHabil(fecha)) {
      avanzarAlProximoDiaHabil(fecha);
      continue;
    }

    const h: number = fecha.getUTCHours();
    let finBloque: Date | null = null;

    if (h >= M_START && h < M_END) {
      finBloque = new Date(fecha);
      finBloque.setUTCHours(M_END, 0, 0, 0);
    } else if (h >= A_START && h < A_END) {
      finBloque = new Date(fecha);
      finBloque.setUTCHours(A_END, 0, 0, 0);
    } else {
      normalizarHoraHaciaAdelante(fecha);
      continue;
    }

    const disponibleEnMinutos: number = Math.floor(
      (finBloque.getTime() - fecha.getTime()) / 60000
    );

    if (minutosRestantes <= disponibleEnMinutos) {
      fecha.setUTCMinutes(fecha.getUTCMinutes() + minutosRestantes);
      minutosRestantes = 0;
      if (fecha.getUTCHours() === M_END && fecha.getUTCMinutes() === 0) {
        fecha.setUTCHours(A_START, 0, 0, 0);
      }
    } else {
      fecha = new Date(finBloque);
      minutosRestantes -= disponibleEnMinutos;
      if (fecha.getUTCHours() === M_END) {
        fecha.setUTCHours(A_START, 0, 0, 0);
      } else if (fecha.getUTCHours() === A_END) {
        avanzarAlProximoDiaHabil(fecha);
      }
    }
  }

  return fecha;
}
