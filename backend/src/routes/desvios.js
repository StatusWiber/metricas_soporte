import express from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/desvios - list deviations with optional filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { operador_id, fecha_desde, fecha_hasta, alerta_solo } = req.query;

    const where = {};
    if (operador_id) where.operador_id = operador_id;
    if (alerta_solo === 'true') where.estado_alerta = { not: 'normal' };
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
    }

    const desvios = await prisma.desvio.findMany({
      where,
      include: {
        operador: true,
        tipo_interaccion: true,
        gestion: true,
      },
      orderBy: { fecha: 'desc' },
    });

    res.json({
      desvios,
      total: desvios.length,
      fechas_range: {
        desde: fecha_desde || null,
        hasta: fecha_hasta || null,
      },
    });
  })
);

// GET /api/desvios/operador/:operador_id - deviations for one operator
router.get(
  '/operador/:operador_id',
  asyncHandler(async (req, res) => {
    const { operador_id } = req.params;
    const { fecha, tipo_interaccion_id } = req.query;

    const operador = await prisma.operador.findUnique({ where: { id: operador_id } });
    if (!operador) return res.status(404).json({ error: 'Operator not found' });

    const where = { operador_id };
    if (tipo_interaccion_id) where.tipo_interaccion_id = parseInt(tipo_interaccion_id);
    if (fecha) {
      const startOfDay = new Date(new Date(fecha).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(fecha).setHours(23, 59, 59, 999));
      where.fecha = { gte: startOfDay, lte: endOfDay };
    }

    const desvios = await prisma.desvio.findMany({
      where,
      include: { tipo_interaccion: true, gestion: true },
      orderBy: { fecha: 'desc' },
    });

    const alertas = desvios.filter((d) => d.estado_alerta !== 'normal');
    const promedio_desvio =
      desvios.length > 0
        ? desvios.reduce((sum, d) => sum + d.desvio_porcentaje, 0) / desvios.length
        : 0;

    res.json({
      operador: operador.nombre,
      operador_id,
      desvios,
      promedio_desvio_porcentaje: parseFloat(promedio_desvio.toFixed(2)),
      alertas_count: alertas.length,
      alertas,
    });
  })
);

export default router;
