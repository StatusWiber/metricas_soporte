import prisma from '../config/db.js';
import { calculateDesvioPercentage, getEstadoAlerta } from '../utils/validators.js';

const DESVIO_THRESHOLD = 20; // percentage threshold for alerts

/**
 * Calculate deviation for a given interaction duration vs expected average
 * @param {number} duracion_real - actual duration in minutes
 * @param {number} tipo_interaccion_id - interaction type ID to look up expected average
 * @returns {{ desvio_porcentaje, estado_alerta, promedio_esperado, mensaje }}
 */
export const calculateDesvio = async (duracion_real, tipo_interaccion_id) => {
  const tipo = await prisma.tipoInteraccion.findUnique({
    where: { id: tipo_interaccion_id },
  });

  if (!tipo) {
    throw new Error(`TipoInteraccion ${tipo_interaccion_id} not found`);
  }

  const promedio_esperado = tipo.promedio_minutos;
  const desvio_porcentaje = calculateDesvioPercentage(duracion_real, promedio_esperado);
  const estado_alerta = getEstadoAlerta(desvio_porcentaje);

  let mensaje = `Interaction within normal range (${desvio_porcentaje.toFixed(1)}%)`;
  if (estado_alerta === 'lento') {
    mensaje = `Slow interaction: ${desvio_porcentaje.toFixed(1)}% above expected average of ${promedio_esperado.toFixed(1)} min`;
  } else if (estado_alerta === 'rapido') {
    mensaje = `Fast interaction: ${Math.abs(desvio_porcentaje).toFixed(1)}% below expected average of ${promedio_esperado.toFixed(1)} min`;
  }

  return {
    desvio_porcentaje: parseFloat(desvio_porcentaje.toFixed(2)),
    estado_alerta,
    promedio_esperado_minutos: promedio_esperado,
    mensaje,
    threshold: DESVIO_THRESHOLD,
  };
};
