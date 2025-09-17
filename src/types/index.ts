// Tipos para la respuesta de la API
export interface SuccessResponse {
    date: string;
  }
  
  export interface ErrorResponse {
    error: string;
    message: string;
  }
  
  // Interfaz para los parámetros de la función de cálculo
  export interface CalculationParams {
    startDate: Date | string | number;
    days: number;
    hours: number;
    holidays: string[];
  }