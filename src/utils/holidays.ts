import axios from "axios";

let holidays: string[] | null = null;
const HOLIDAYS_URL = "https://content.capta.co/Recruitment/WorkingDays.json";

export const getHolidays = async (): Promise<string[]> => {
  if (holidays) {
    return holidays;
  }

  try {
    const response = await axios.get<string[]>(HOLIDAYS_URL);

    holidays = response.data;

    console.log("✅ Holidays loaded successfully.");
    return holidays;
  } catch (error) {
    console.error("❌ Could not load holidays.", error);
    throw new Error("Could not initialize holiday data.");
  }
};
