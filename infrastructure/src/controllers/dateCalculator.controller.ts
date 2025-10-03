import { Request, Response } from "express";
import { getHolidays } from "../utils/holidays";
import { calculateBusinessDate } from "../services/dateCalculator.service";
import { SuccessResponse, ErrorResponse, CalculationParams } from "../types";

export const getCalculatedDate = async (
  req: Request,
  res: Response<SuccessResponse | ErrorResponse>
): Promise<void> => {
  try {
    const { days, hours, date } = req.query;

    if (!days && !hours) {
      res.status(400).json({
        error: "InvalidParameters",
        message: 'At least one of "days" or "hours" must be provided.', //Se debe proporcionar al menos uno de "días" u "horas".
      });
      return;
    }

    const daysNumber = days ? parseInt(days as string, 10) : 0;
    const hoursNumber = hours ? parseInt(hours as string, 10) : 0;

    if (
      isNaN(daysNumber) ||
      daysNumber < 0 ||
      isNaN(hoursNumber) ||
      hoursNumber < 0
    ) {
      res.status(400).json({
        error: "InvalidParameters",
        message: '"days" and "hours" must be positive integers.', // Los valores de «días» y «horas» deben ser números enteros positivos.
      });
      return;
    }

    // 3. Determinar la fecha de inicio
    let startDate: Date;
    if (date) {
      startDate = new Date(date as string);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          error: "InvalidParameters",
          message: '"date" must be a valid ISO 8601 string.', // «date» debe ser una cadena válida según la norma ISO 8601
        });
        return;
      }
    } else {
      startDate = new Date();
    }

    const holidays = await getHolidays();
    const calculateParams: CalculationParams = {
      startDate,
      days: daysNumber,
      hours: hoursNumber,
      holidays,
    };
    const finalDate = await calculateBusinessDate(calculateParams);

    // 5. Enviar respuesta exitosa
    res.status(200).json({
      date: finalDate,
    });
  } catch (error) {

    // Manejar errores internos (ej. si no se pueden cargar los festivos)
    if (error instanceof Error && error.message.includes("holidays")) {
      res.status(503).json({
        error: "ServiceUnavailable",
        message:
          "The holiday service is currently unavailable. Please try again later.", //El servicio de vacaciones no está disponible en este momento. Inténtelo de nuevo más tarde.
      });
      return;
    }

    res.status(500).json({
      error: "InternalServerError",
      message: "An unexpected error occurred.",
    });
  }
};
