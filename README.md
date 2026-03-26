# Wiber Metrics - Performance Measurement System

System for measuring and tracking performance metrics across multiple data sources.

## Tech Stack

- **Runtime:** Node.js LTS
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Operating System:** Linux (Ubuntu)

## Prerequisites

- Node.js LTS (v18 or higher)
- npm or yarn
- Supabase account (for DATABASE_URL)
- API Keys for integrations (Typeform, Suricata, ANATOD)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/StatusWiber/metricas_soporte.git
cd metricas_soporte
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:
- `DATABASE_URL`: Your Supabase connection string
- `TYPEFORM_API_TOKEN`: Your Typeform API token
- `SURICATA_API_KEY` and `SURICATA_API_URL`: Suricata integration
- `ANATOD_API_KEY` and `ANATOD_API_URL`: ANATOD integration

## Running the Project

### Development Mode
```bash
npm run dev
```

This will start the server with nodemon for automatic reloading on file changes.

### Production Mode
```bash
npm start
```

### Database

Initialize Prisma and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/gestiones` - Management endpoints (to be implemented)
- `GET /api/desvios` - Deviations endpoints (to be implemented)
- `POST /api/webhooks` - Webhook endpoints (to be implemented)

## Project Structure

```
src/
├── routes/          # API route handlers
├── models/          # Data models and types
├── services/        # Business logic
├── utils/           # Utility functions
├── middleware/      # Custom middleware
├── config/          # Configuration files
└── index.js         # Application entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations

public/              # Static files
```

## Environment Variables

Required environment variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `TYPEFORM_API_TOKEN` - Typeform API authentication token
- `SURICATA_API_KEY` - Suricata API key
- `SURICATA_API_URL` - Suricata API endpoint URL
- `ANATOD_API_KEY` - ANATOD API key
- `ANATOD_API_URL` - ANATOD API endpoint URL
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Development Notes

- No local PostgreSQL installation needed (using Supabase cloud)
- Authentication will be configured in future phases
- All code should be written in English
- Follow the existing folder structure for new features

## License

MIT

## Contact

Wiber Team
