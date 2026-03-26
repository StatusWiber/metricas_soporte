import prisma from '../config/db.js';
import { calculateDesvio } from './calculoDesvios.js';

const CAPACIDAD_THRESHOLD = 15; // percentage threshold for capacity status

/**
 * Create a new interaction with automatic deviation and alert calculation
 */
export const createGestion = async (data) => {
  const {
    source,
    source_id,
    operador_id,
    tipo_interaccion_id,
    timestamp_inicio,
    timestamp_fin,
    estado = 'cerrado',
    metadata = null,
  } = data;

  // Calculate duration
  const inicio = new Date(timestamp_inicio);
  const fin = timestamp_fin ? new Date(timestamp_fin) : null;
  const duracion_segundos = fin ? Math.round((fin - inicio) / 1000) : null;
  const duracion_minutos = duracion_segundos ? parseFloat((duracion_segundos / 60).toFixed(2)) : null;

  // Create the interaction record
  const gestion = await prisma.gestion.create({
    data: {
      source,
      source_id,
      operador_id,
      tipo_interaccion_id,
      timestamp_inicio: inicio,
      timestamp_fin: fin,
      duracion_segundos,
      duracion_minutos,
      estado,
      metadata,
    },
    include: {
      operador: true,
      tipo_interaccion: true,
    },
  });

  let desvio = null;
  let alerta = null;

  // Only calculate deviation if we have duration
  if (duracion_minutos !== null) {
    const desvioCalc = await calculateDesvio(duracion_minutos, tipo_interaccion_id);

    desvio = await prisma.desvio.create({
      data: {
        gestion_id: gestion.id,
        operador_id,
        tipo_interaccion_id,
        promedio_esperado_minutos: desvioCalc.promedio_esperado_minutos,
        duracion_real_minutos: duracion_minutos,
        desvio_porcentaje: desvioCalc.desvio_porcentaje,
        estado_alerta: desvioCalc.estado_alerta,
        fecha: inicio,
      },
    });

    // Generate alert if deviation exceeds threshold
    if (desvioCalc.estado_alerta !== 'normal') {
      alerta = await prisma.alerta.create({
        data: {
          gestion_id: gestion.id,
          operador_id,
          tipo_alerta: 'desvio_alto',
          mensaje: desvioCalc.mensaje,
        },
      });
    }
  }

  return { gestion, desvio, alerta };
};

/**
 * Get all interactions for a specific operator, optionally filtered by date range
 */
export const getGestionesByOperador = async (operador_id, fecha_desde, fecha_hasta) => {
  const where = { operador_id };

  if (fecha_desde || fecha_hasta) {
    where.timestamp_inicio = {};
    if (fecha_desde) where.timestamp_inicio.gte = new Date(fecha_desde);
    if (fecha_hasta) where.timestamp_inicio.lte = new Date(fecha_hasta);
  }

  const gestiones = await prisma.gestion.findMany({
    where,
    include: {
      operador: true,
      tipo_interaccion: true,
      desvios: true,
      alertas: true,
    },
    orderBy: { timestamp_inicio: 'desc' },
  });

  return gestiones.map((g) => ({
    gestion: g,
    desvio: g.desvios[0] || null,
    alerta: g.alertas[0] || null,
  }));
};

/**
 * Calculate operator capacity status for a given date
 */
export const getCapacidadOperador = async (operador_id, fecha) => {
  const day = fecha ? new Date(fecha) : new Date();
  const startOfDay = new Date(day.setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date(startOfDay).setHours(23, 59, 59, 999));

  const desvios = await prisma.desvio.findMany({
    where: {
      operador_id,
      fecha: { gte: startOfDay, lte: endOfDay },
    },
  });

  if (desvios.length === 0) {
    return {
      capacidad: 'SIN DATOS',
      desvio_promedio: 0,
      interacciones_hoy: 0,
      estado: 'sin_datos',
    };
  }

  const desvio_promedio =
    desvios.reduce((sum, d) => sum + d.desvio_porcentaje, 0) / desvios.length;

  let capacidad, estado;
  if (desvio_promedio < -CAPACIDAD_THRESHOLD) {
    capacidad = 'CAPACIDAD LIBRE';
    estado = 'libre';
  } else if (desvio_promedio > CAPACIDAD_THRESHOLD) {
    capacidad = 'SATURADO';
    estado = 'saturado';
  } else {
    capacidad = 'NORMAL';
    estado = 'normal';
  }

  return {
    capacidad,
    desvio_promedio: parseFloat(desvio_promedio.toFixed(2)),
    interacciones_hoy: desvios.length,
    estado,
  };
};

/**
 * Get team-wide metrics for a given date
 */
export const getMetricasEquipo = async (fecha) => {
  const day = fecha ? new Date(fecha) : new Date();
  const startOfDay = new Date(new Date(day).setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date(startOfDay).setHours(23, 59, 59, 999));

  // Get all interactions with deviations for the day
  const gestiones = await prisma.gestion.findMany({
    where: {
      timestamp_inicio: { gte: startOfDay, lte: endOfDay },
      duracion_minutos: { not: null },
    },
    include: {
      operador: true,
      tipo_interaccion: true,
      desvios: true,
      alertas: true,
    },
  });

  const operadores = await prisma.operador.findMany();
  const alertasHoy = await prisma.alerta.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
  });

  // Global MTTR
  const mttr_real =
    gestiones.length > 0
      ? gestiones.reduce((sum, g) => sum + (g.duracion_minutos || 0), 0) / gestiones.length
      : 0;

  const referencias = await prisma.tipoInteraccion.findMany();
  const mttr_esperado =
    referencias.length > 0
      ? referencias.reduce((sum, r) => sum + r.promedio_minutos, 0) / referencias.length
      : 0;

  const desvio_general =
    mttr_esperado > 0 ? ((mttr_real - mttr_esperado) / mttr_esperado) * 100 : 0;

  // Per-operator metrics
  const operadoresMetricas = await Promise.all(
    operadores.map(async (op) => {
      const capacidad = await getCapacidadOperador(op.id, fecha);
      const alertas_count = alertasHoy.filter((a) => a.operador_id === op.id).length;
      return {
        nombre: op.nombre,
        operador_id: op.id,
        capacidad: capacidad.capacidad,
        desvio_promedio: capacidad.desvio_promedio,
        interacciones_hoy: capacidad.interacciones_hoy,
        alertas_count,
      };
    })
  );

  // Per-type metrics
  const tiposMap = {};
  for (const g of gestiones) {
    const key = g.tipo_interaccion_id;
    if (!tiposMap[key]) {
      tiposMap[key] = {
        tipo: g.tipo_interaccion.nombre,
        tipo_id: key,
        cantidad: 0,
        total_real: 0,
        esperado: g.tipo_interaccion.promedio_minutos,
      };
    }
    tiposMap[key].cantidad++;
    tiposMap[key].total_real += g.duracion_minutos || 0;
  }

  const interacciones_por_tipo = Object.values(tiposMap).map((t) => {
    const mttr_real_tipo = t.cantidad > 0 ? t.total_real / t.cantidad : 0;
    const desvio = t.esperado > 0 ? ((mttr_real_tipo - t.esperado) / t.esperado) * 100 : 0;
    return {
      tipo: t.tipo,
      cantidad: t.cantidad,
      mttr_real: parseFloat(mttr_real_tipo.toFixed(2)),
      mttr_esperado: t.esperado,
      desvio_porcentaje: parseFloat(desvio.toFixed(2)),
    };
  });

  return {
    fecha: startOfDay.toISOString().split('T')[0],
    mttr_real_minutos: parseFloat(mttr_real.toFixed(2)),
    mttr_esperado_minutos: parseFloat(mttr_esperado.toFixed(2)),
    desvio_general_porcentaje: parseFloat(desvio_general.toFixed(2)),
    total_interacciones: gestiones.length,
    operadores: operadoresMetricas,
    interacciones_por_tipo,
  };
};
