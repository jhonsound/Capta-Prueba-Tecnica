export interface SuccessResponse {
  date: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface CalculationParams {
  startDate: Date | string | number;
  days: number;
  hours: number;
  holidays: string[];
}
