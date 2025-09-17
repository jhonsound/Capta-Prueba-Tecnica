# Capta Business Date Calculator

Este proyecto es un servicio backend en Node.js y TypeScript para calcular fechas hábiles considerando días festivos y horarios laborales personalizados. Permite sumar días y horas hábiles a una fecha inicial, ajustando automáticamente por fines de semana, festivos y bloques de horario laboral.

## Características
- Suma de días y horas hábiles a una fecha inicial.
- Ajuste automático por fines de semana y festivos.
- Configuración flexible de horarios laborales y almuerzo.
- API REST para consulta desde clientes externos.
- Estructura modular siguiendo principios SOLID.

## Estructura del proyecto
```
CAPTA/
├── src/
│   ├── constants/         # Constantes de negocio y horarios
│   ├── controllers/       # Controladores de rutas
│   ├── helpers/           # Funciones auxiliares
│   ├── routes/            # Definición de rutas
│   ├── services/          # Lógica principal de cálculo
│   ├── tests/             # Escenarios de prueba
│   ├── types/             # Tipos y interfaces
│   └── utils/             # Utilidades de fechas y festivos
├── package.json
├── tsconfig.json
├── vercel.json
├── .gitignore
└── README.md
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jhonsound/Capta-Prueba-Tecnica.git
   cd Capta-Prueba-Tecnica
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

## Uso

Consulta la API para calcular una fecha hábil:

```
GET /api/calculate-date?date=2025-09-16T08:00:00Z&days=2&hours=5
```

- `date`: Fecha inicial en formato ISO 8601
- `days`: Días hábiles a sumar
- `hours`: Horas hábiles a sumar

La respuesta será la fecha final ajustada según las reglas de negocio.

## Pruebas

Ejecuta los escenarios de prueba:
```bash
npm test
```

## Autor
- Jhonsound

## Licencia
MIT
