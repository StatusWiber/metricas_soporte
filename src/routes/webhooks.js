import express from 'express';
import prisma from '../config/db.js';
import { createGestion } from '../services/gestionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/webhooks/typeform - receive Typeform form submission
router.post(
  '/typeform',
  asyncHandler(async (req, res) => {
    const payload = req.body;

    // Basic payload validation
    if (!payload || !payload.form_id) {
      return res.status(400).json({ error: 'Invalid Typeform payload' });
    }

    const response = payload.data?.response || payload.form_response;
    if (!response) {
      return res.status(400).json({ error: 'Missing response data in payload' });
    }

    const answers = response.answers || [];
    if (answers.length === 0) {
      return res.status(400).json({ error: 'No answers found in response' });
    }

    // Extract fields from Typeform answers
    // Expected order: operador name, tipo interaccion, date, duracion_segundos
    const operadorNombre = extractAnswer(answers, 'short_text', 0)?.toUpperCase();
    const tipoNombre = extractAnswer(answers, 'short_text', 1)?.toUpperCase();
    const duracion_segundos = extractAnswer(answers, 'number', 3);

    if (!operadorNombre) {
      return res.status(400).json({ error: 'Missing operator name in answers' });
    }

    if (!tipoNombre) {
      return res.status(400).json({ error: 'Missing interaction type in answers' });
    }

    if (!duracion_segundos || duracion_segundos === 0) {
      return res.status(400).json({ error: 'Duration cannot be zero' });
    }

    // Look up or auto-create operator
    const operador_id = `OPE-${operadorNombre}`;
    let operador = await prisma.operador.findUnique({ where: { id: operador_id } });
    if (!operador) {
      operador = await prisma.operador.create({
        data: { id: operador_id, nombre: operadorNombre },
      });
    }

    // Look up interaction type
    const tipoInteraccion = await prisma.tipoInteraccion.findUnique({
      where: { nombre: tipoNombre },
    });
    if (!tipoInteraccion) {
      return res.status(400).json({
        error: `Interaction type not found: ${tipoNombre}`,
        valid_types: await prisma.tipoInteraccion.findMany({ select: { nombre: true } }),
      });
    }

    // Build timestamps
    const timestamp_inicio = new Date(response.landed_at || response.submitted_at);
    const timestamp_fin = new Date(timestamp_inicio.getTime() + duracion_segundos * 1000);

    // Create the full interaction record
    const result = await createGestion({
      source: 'typeform',
      source_id: response.token || payload.event_id,
      operador_id,
      tipo_interaccion_id: tipoInteraccion.id,
      timestamp_inicio,
      timestamp_fin,
      estado: 'cerrado',
      metadata: {
        form_id: payload.form_id,
        event_id: payload.event_id,
        raw_answers: answers,
      },
    });

    res.status(201).json({
      status: 'ok',
      gestion_id: result.gestion.id,
      operador: operadorNombre,
      tipo: tipoNombre,
      duracion_minutos: result.gestion.duracion_minutos,
      desvio_porcentaje: result.desvio?.desvio_porcentaje ?? null,
      estado_alerta: result.desvio?.estado_alerta ?? null,
      alerta_generada: result.alerta !== null,
    });
  })
);

// Helper: extract answer by type and positional index among that type
function extractAnswer(answers, type, indexOfType) {
  const filtered = answers.filter((a) => a.type === type);
  const answer = filtered[indexOfType];
  if (!answer) return null;

  switch (type) {
    case 'short_text':
    case 'long_text':
    case 'text':
      return answer.text || answer.short_text || null;
    case 'number':
      return answer.number ?? null;
    case 'date':
      return answer.date || null;
    case 'choice':
      return answer.choice?.label || null;
    default:
      return null;
  }
}

export default router;
