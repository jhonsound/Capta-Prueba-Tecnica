
// Utilidad para obtener y cachear los días festivos desde un endpoint externo
import axios from "axios";


// Variable de cache para los festivos
let holidays: string[] | null = null;
// URL del endpoint de festivos
const HOLIDAYS_URL = "https://content.capta.co/Recruitment/WorkingDays.json";


// Obtiene los días festivos desde el endpoint y los cachea en memoria
export const getHolidays = async (): Promise<string[]> => {
  // Si ya están cacheados, devolver directamente
  if (holidays) {
    return holidays;
  }

  try {
    // Petición HTTP para obtener los festivos
    const response = await axios.get<string[]>(HOLIDAYS_URL);

    holidays = response.data;

    // Log de éxito en la carga de festivos
    console.log("✅ Holidays loaded successfully.");
    return holidays;
  } catch (error) {
    // Log de error si falla la carga
    console.error("❌ Could not load holidays.", error);
    throw new Error("Could not initialize holiday data.");
  }
};
