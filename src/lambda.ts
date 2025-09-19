// src/lambda.ts

import serverlessExpress from "@vendia/serverless-express";
import express, { Application } from "express";
import apiRoutes from "./routes/index";
import { getHolidays } from "./utils/holidays";

// NOTA: No usamos app.listen() aquí

// Creamos la app de Express
const app: Application = express();
app.use(express.json());

// Cargamos los festivos al iniciar
getHolidays().catch((error) => {
  console.error("Failed to pre-load holidays:", error);
});

// Usamos las mismas rutas
app.use("/api", apiRoutes);

// Exportamos el manejador (handler) para AWS Lambda
const handler = serverlessExpress({ app });

export default handler;
