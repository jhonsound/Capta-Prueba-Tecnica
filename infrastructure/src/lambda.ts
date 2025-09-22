
import serverlessExpress from "@vendia/serverless-express";
import express, { Application } from "express";
import apiRoutes from "./routes/index";
import { getHolidays } from "./utils/holidays";


const app: Application = express();
app.use(express.json());

getHolidays().catch((error) => {
  console.error("Failed to pre-load holidays:", error);
});

app.use("/api", apiRoutes);

const handler = serverlessExpress({ app });


exports.handler = handler;
