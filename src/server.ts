// src/routes/index.ts
// src/server.ts

import express, { Application } from 'express';
import apiRoutes from './routes';
import { getHolidays } from './utils/holidays';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', apiRoutes);

getHolidays().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error("Failed to start server:", error.message);
    process.exit(1); // Detener la aplicación si no se pueden cargar los festivos
});