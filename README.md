# Wiber Metrics - Sistema Web Centralizado de Medición de Rendimiento

Sistema completo para medir y monitorear el rendimiento del equipo de soporte técnico en Wiber (ISP Mendoza).

## 🏗️ Estructura del Proyecto

```
wiber-metrics/
├── backend/          # API REST (Node.js + Express + Prisma + Supabase)
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
├── frontend/         # Dashboard (React + TailwindCSS + Recharts)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install

# Llenar .env con datos de Supabase
cp .env.example .env

# Configurar la base de datos
npm run prisma:migrate
npm run prisma:seed

# Correr en desarrollo
npm run dev
```

Backend escucha en **http://localhost:3000**

### Frontend Setup

```bash
cd frontend
npm install

# Correr en desarrollo
npm run dev
```

Frontend escucha en **http://localhost:5173** y proxea `/api` a `http://localhost:3000`

## 📊 Características

### Dashboard Principal (`/`)
- 📈 Métricas de equipo en tiempo real
- 📊 Gráficos: desvíos, distribución de interacciones
- 👥 Tarjetas de operadores con estado de capacidad
- ⚠️ Tabla de desvíos del día
- 🔴 Panel de alertas activas
- Auto-refresh cada 30 segundos

### Detalle de Operador (`/operador/:operador_id`)
- Estado de capacidad (NORMAL / SATURADO / LIBRE)
- Historial de desvíos del día
- Interacciones recientes
- MTTR real vs esperado

### Centro de Alertas (`/alertas`)
- Lista filtrable de alertas
- Estadísticas de desvíos
- Filtros por operador y estado
- Ordenamiento por fecha

## 🔌 API Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/gestiones` | Listar interacciones |
| GET | `/api/gestiones/metricas/equipo` | Métricas del equipo |
| GET | `/api/gestiones/operador/:id` | Interacciones por operador |
| GET | `/api/gestiones/capacidad/:id` | Capacidad del operador |
| GET | `/api/desvios` | Listar desvíos |
| GET | `/api/desvios/operador/:id` | Desvíos por operador |
| POST | `/api/webhooks/typeform` | Recibir datos de Typeform |

## 🛠️ Tecnologías

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Framework web
- **Prisma** - ORM
- **PostgreSQL** (Supabase) - Base de datos
- **Axios** - HTTP client

### Frontend
- **React 18** - UI Framework
- **TailwindCSS** - Styling
- **Recharts** - Gráficos
- **Lucide React** - Iconos
- **Vite** - Build tool
- **React Router** - Navegación

## 📋 Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://...
TYPEFORM_API_TOKEN=xxxxx
SURICATA_API_KEY=xxxxx
SURICATA_API_URL=https://...
ANATOD_API_KEY=xxxxx
ANATOD_API_URL=https://...
PORT=3000
NODE_ENV=development
```

## 🔄 Flujo de Datos

```
Typeform (cronómetro)
    ↓
POST /api/webhooks/typeform
    ↓
Backend crea Gestion + calcula Desvio + genera Alerta
    ↓
Frontend consulta /api/metricas/equipo cada 30s
    ↓
Dashboard se actualiza en tiempo real
```

## 📊 Cálculo de Desvíos

```
desvio% = (duracion_real - promedio_esperado) / promedio_esperado * 100

Estados:
- |desvio%| ≤ 20%  → NORMAL (verde)
- desvio% > +20%   → LENTO (rojo)
- desvio% < -20%   → RÁPIDO (azul)
```

## 📈 Estado de Capacidad

```
Promedio diario de desvios por operador:

< -15%   → CAPACIDAD LIBRE (puede aceptar más trabajo)
-15 a +15% → NORMAL
> +15%   → SATURADO (necesita apoyo)
```

## 🎨 Paleta de Colores

- **Primary Cyan**: `#06b6d4` - Acciones principales
- **Secondary Teal**: `#0d9488` - Secundarias
- **Success Emerald**: `#10b981` - Estados OK
- **Warning Amber**: `#f59e0b` - Precaución
- **Danger Red**: `#ef4444` - Alertas críticas
- **Info Blue**: `#3b82f6` - Información
- **Background**: `#111827` - Fondo oscuro

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Tablet (768px-1920px)
- ✅ Mobile (320px-768px) - Básico

## 🔐 Seguridad

- No hay autenticación en la Fase 1
- Próxima fase: JWT + OAuth
- Validación básica en backend
- CORS habilitado

## 🚢 Deploy

### Vercel (Frontend)
1. Push a GitHub
2. Conectar repo en Vercel
3. Configurar variable `VITE_API_URL` si es necesario

### Railway/Render (Backend)
1. Conectar repo
2. Configurar `DATABASE_URL`
3. Ejecutar `npm run prisma:migrate`

## 📚 Documentación

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 🗓️ Roadmap

- ✅ **Fase 1**: Typeform + Desvíos + Dashboard
- 🔄 **Fase 2**: Suricata + Anatod + Alertas Telegram
- 📅 **Fase 3**: Reportes Excel + Looker Studio
- 🔐 **Fase 4**: Autenticación + Usuarios

## 👥 Equipo

- **Supervisor**: Fede
- **Operadores**: CRISTIAN, ROCIO, NICOLÁS, GUSTAVO

## 📝 Licencia

MIT

## 📧 Contacto

Wiber Team
