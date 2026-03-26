import express from 'express';
import prisma from '../config/db.js';
import {
  getGestionesByOperador,
  getCapacidadOperador,
  getMetricasEquipo,
} from '../services/gestionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/gestiones - list all interactions with optional filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { operador_id, fecha_desde, fecha_hasta } = req.query;

    const where = {};
    if (operador_id) where.operador_id = operador_id;
    if (fecha_desde || fecha_hasta) {
      where.timestamp_inicio = {};
      if (fecha_desde) where.timestamp_inicio.gte = new Date(fecha_desde);
      if (fecha_hasta) where.timestamp_inicio.lte = new Date(fecha_hasta);
    }

    const gestiones = await prisma.gestion.findMany({
      where,
      include: { operador: true, tipo_interaccion: true, desvios: true, alertas: true },
      orderBy: { timestamp_inicio: 'desc' },
    });

    res.json({
      gestiones,
      total: gestiones.length,
      fecha_consulta: new Date().toISOString(),
    });
  })
);

// GET /api/gestiones/metricas/equipo - team metrics for a date
router.get(
  '/metricas/equipo',
  asyncHandler(async (req, res) => {
    const { fecha } = req.query;
    const metricas = await getMetricasEquipo(fecha);
    res.json(metricas);
  })
);

// GET /api/gestiones/operador/:operador_id - interactions for one operator
router.get(
  '/operador/:operador_id',
  asyncHandler(async (req, res) => {
    const { operador_id } = req.params;
    const { fecha } = req.query;

    const fecha_desde = fecha
      ? new Date(new Date(fecha).setHours(0, 0, 0, 0)).toISOString()
      : undefined;
    const fecha_hasta = fecha
      ? new Date(new Date(fecha).setHours(23, 59, 59, 999)).toISOString()
      : undefined;

    const operador = await prisma.operador.findUnique({ where: { id: operador_id } });
    if (!operador) return res.status(404).json({ error: 'Operator not found' });

    const items = await getGestionesByOperador(operador_id, fecha_desde, fecha_hasta);
    const capacidad = await getCapacidadOperador(operador_id, fecha);

    const duraciones = items
      .map((i) => i.gestion.duracion_minutos)
      .filter((d) => d !== null);
    const mttr_real =
      duraciones.length > 0
        ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length
        : 0;

    res.json({
      operador,
      gestiones: items,
      mttr_real_min: parseFloat(mttr_real.toFixed(2)),
      desvio_promedio: capacidad.desvio_promedio,
      capacidad: capacidad.capacidad,
    });
  })
);

// GET /api/gestiones/capacidad/:operador_id - capacity status for operator
router.get(
  '/capacidad/:operador_id',
  asyncHandler(async (req, res) => {
    const { operador_id } = req.params;
    const { fecha } = req.query;

    const operador = await prisma.operador.findUnique({ where: { id: operador_id } });
    if (!operador) return res.status(404).json({ error: 'Operator not found' });

    const capacidad = await getCapacidadOperador(operador_id, fecha);

    res.json({
      operador: operador.nombre,
      operador_id,
      ...capacidad,
    });
  })
);

// GET /api/gestiones/:id - single interaction with deviation and alert
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const gestion = await prisma.gestion.findUnique({
      where: { id },
      include: { operador: true, tipo_interaccion: true, desvios: true, alertas: true },
    });

    if (!gestion) return res.status(404).json({ error: 'Gestion not found' });

    res.json({
      gestion,
      desvio: gestion.desvios[0] || null,
      alerta: gestion.alertas[0] || null,
    });
  })
);

export default router;
