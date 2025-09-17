import { calculateBusinessDate } from "../services/dateCalculator.service";
import { getHolidays } from "../utils/holidays";

type Case = {
  name: string;
  params: { startDate: Date; days: number; hours: number };
  expectedHint?: string;
};

// Helper para construir fecha UTC a partir de hora local Colombia (UTC-5)
function buildUTCDateFromColombia(
  y: number,
  m: number, // 1-12
  d: number,
  hourCol: number,
  minuteCol: number = 0
): Date {
  const iso = new Date(Date.UTC(y, m - 1, d, hourCol + 5, minuteCol, 0, 0));
  return iso;
}

async function run() {
  const holidays = await getHolidays();

  const cases: Case[] = [
    {
      name: "1) Viernes 5:00 p.m. COL + hours=1",
      params: {
        // Viernes 2025-06-06
        startDate: new Date("2025-06-06T22:00:00.000Z"),
        days: 0,
        hours: 1,
      },
      expectedHint: "Esperado aprox: Lunes 9:00 a.m. COL → 14:00Z",
    },
    {
      name: "2) Sábado 2:00 p.m. COL + hours=1",
      params: {
        // Sábado 2025-06-07 14:00 COL → 19:00Z
        startDate: new Date("2025-06-07T19:00:00.000Z"),
        days: 0,
        hours: 1,
      },
      expectedHint: "Esperado aprox: Lunes 9:00 a.m. COL → 14:00Z",
    },
    {
      name: "3) Martes 3:00 p.m. COL + days=1 + hours=3",
      params: {
        // Martes 2025-06-03 15:00 COL → 20:00Z
        startDate: new Date("2025-06-03T20:00:00.000Z"),
        days: 1,
        hours: 3,
      },
      expectedHint: "Esperado aprox: Jueves 10:00 a.m. COL → 15:00Z",
    },
    {
      name: "4) Domingo 6:00 p.m. COL + days=1",
      params: {
        // Domingo 2025-06-01 18:00 COL → 23:00Z
        startDate: new Date("2025-06-01T23:00:00.000Z"),
        days: 1,
        hours: 0,
      },
      expectedHint: "Esperado aprox: Lunes 5:00 p.m. COL → 22:00Z",
    },
    {
      name: "5) Día laboral 8:00 a.m. COL + hours=8",
      params: {
        // Lunes 2025-06-02 08:00 COL → 13:00Z
        startDate: new Date("2025-06-02T13:00:00.000Z"),
        days: 0,
        hours: 8,
      },
      expectedHint: "Esperado aprox: Mismo día 5:00 p.m. COL → 22:00Z",
    },
    {
      name: "6) Día laboral 8:00 a.m. COL + days=1",
      params: {
        // Martes 2025-06-03 08:00 COL → 13:00Z
        startDate: new Date("2025-06-03T13:00:00.000Z"),
        days: 1,
        hours: 0,
      },
      expectedHint: "Esperado aprox: Siguiente día 8:00 a.m. COL → 13:00Z",
    },
    {
      name: "7) Día laboral 12:30 p.m. COL + days=1",
      params: {
        // Miércoles 2025-06-04 12:30 COL → 17:30Z
        startDate: new Date("2025-06-04T17:30:00.000Z"),
        days: 1,
        hours: 0,
      },
      expectedHint: "Esperado aprox: Siguiente día 12:00 p.m. COL → 17:00Z",
    },
    {
      name: "8) Día laboral 11:30 p.m. COL + hours=3",
      params: {
        // Jueves 2025-06-05 23:30 COL → 2025-06-06 04:30Z (UTC del día siguiente)
        // Pero el requerimiento habla de "desde un día laboral a las 11:30 p.m.",
        // fijamos un jueves para que el siguiente sea viernes hábil.
        startDate: new Date("2025-06-06T04:30:00.000Z"),
        days: 0,
        hours: 3,
      },
      expectedHint: "Esperado aprox: Mismo día laboral 3:30 p.m. COL → 20:30Z",
    },
    {
      name: "9) date=2025-04-10T15:00:00.000Z, days=5, hours=4 (17 y 18 festivos)",
      params: {
        startDate: new Date("2025-04-10T15:00:00.000Z"),
        days: 5,
        hours: 4,
      },
      expectedHint: "Esperado: 2025-04-21T20:00:00.000Z",
    },
  ];

  for (const c of cases) {
    const result = await calculateBusinessDate(
      { startDate: c.params.startDate, days: c.params.days, hours: c.params.hours },
      holidays
    );
    console.log("\n---", c.name, "---");
    console.log("Start:", c.params.startDate.toISOString(), "days=", c.params.days, "hours=", c.params.hours);
    console.log("Result:", result.toISOString());
    if (c.expectedHint) console.log("Hint:", c.expectedHint);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


