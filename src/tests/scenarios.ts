import { cases } from "../constants/test";
import { calculateBusinessDate } from "../services/dateCalculator.service";
import { holidays } from "../constants/test";

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
  /* const holidays = await getHolidays(); */

  for (const c of cases) {
    const result = await calculateBusinessDate({
      startDate: c.params.startDate,
      days: c.params.days,
      hours: c.params.hours,
      holidays,
    });
    console.log("\n---", c.name, "---");
    console.log(
      "Start:",
      c.params.startDate.toISOString(),
      "days=",
      c.params.days,
      "hours=",
      c.params.hours
    );
    console.log("Result:", result.toISOString());
    if (c.expectedHint) console.log("Hint:", c.expectedHint);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
