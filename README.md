# Wiber Metrics - Performance Measurement System

Automated system for measuring and tracking support team performance at Wiber ISP (Mendoza, Argentina).

## Team
- CRISTIAN, ROCIO, NICOLÁS, GUSTAVO, FEDE

## Data Sources
| Source | Description |
|--------|-------------|
| Typeform | Real-time interaction timer (webhook) |
| Suricata | Ticket management system (Phase 2) |
| Anatod | Unified records system (Phase 2) |

## Tech Stack
- **Runtime:** Node.js LTS
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL cloud)
- **ORM:** Prisma

## Project Structure
```
src/
├── routes/
│   ├── gestiones.js    # Interaction CRUD + metrics endpoints
│   ├── desvios.js      # Deviation endpoints
│   └── webhooks.js     # Typeform webhook receiver
├── services/
│   ├── gestionService.js     # Business logic: create, query, metrics
│   └── calculoDesvios.js     # Deviation calculation engine
├── middleware/
│   └── errorHandler.js       # Global error handler + async wrapper
├── utils/
│   └── validators.js         # Input validators and helpers
├── config/
│   └── db.js                 # Prisma client singleton
└── index.js                  # App entry point

prisma/
├── schema.prisma   # Database schema
└── seed.js         # Initial data (operators + interaction types)
```

## Setup

### 1. Clone and install
```bash
git clone https://github.com/StatusWiber/metricas_soporte.git
cd metricas_soporte
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in your Supabase `DATABASE_URL` and API keys.

### 3. Initialize database
```bash
npm run prisma:generate        # Generate Prisma client
npx prisma migrate dev --name initial   # Create tables in Supabase
npm run prisma:seed            # Load operators and interaction types
```

### 4. Run development server
```bash
npm run dev
# Server running on http://localhost:3000
```

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server status |

### Gestiones (Interactions)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gestiones` | List all (filters: operador_id, fecha_desde, fecha_hasta) |
| GET | `/api/gestiones/:id` | Single interaction with deviation |
| GET | `/api/gestiones/operador/:id` | Operator's interactions (filter: fecha) |
| GET | `/api/gestiones/capacidad/:id` | Operator capacity status |
| GET | `/api/gestiones/metricas/equipo` | Full team metrics (filter: fecha) |

### Desvíos (Deviations)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/desvios` | List deviations (filters: operador_id, fecha_desde, fecha_hasta, alerta_solo) |
| GET | `/api/desvios/operador/:id` | Operator deviations (filters: fecha, tipo_interaccion_id) |

### Webhooks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/typeform` | Receive Typeform form submission |

## Typeform Webhook Setup

1. In Typeform, go to your form → **Connect → Webhooks**
2. Add webhook URL: `https://your-domain.vercel.app/api/webhooks/typeform`
3. Expected answer order in form:
   - Answer 1 (short_text): Operator name (e.g. `CRISTIAN`)
   - Answer 2 (short_text): Interaction type (e.g. `SIN INTERNET`)
   - Answer 3 (date): Date
   - Answer 4 (number): Duration in seconds

## Interaction Types (Reference MTTR)
| Type | Expected Average |
|------|-----------------|
| CONSULTAS ADICIONALES | 3.73 min |
| TV | 4.35 min |
| SIN INTERNET | 3.83 min |
| INTERMITENCIAS / LENTITUD | 5.22 min |
| DERIVACIÓN DE CHAT | 0.67 min |

## Deviation Logic
- `desvio% = (real - expected) / expected * 100`
- `|desvio%| ≤ 20%` → **NORMAL**
- `desvio% > +20%` → **LENTO** (alert generated)
- `desvio% < -20%` → **RAPIDO** (alert generated)

## Capacity Status
- `avg_desvio% < -15%` → **CAPACIDAD LIBRE** (operator is faster than usual)
- `avg_desvio% > +15%` → **SATURADO** (operator is slower than usual)
- `-15% ≤ avg_desvio% ≤ +15%` → **NORMAL**

## Roadmap
- **Phase 1 (current):** Typeform integration, deviation calculation, alerts
- **Phase 2:** Suricata + Anatod integration, Sentry logging
- **Phase 3:** Dashboard UI, authentication, reports
