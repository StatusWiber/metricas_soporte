import prisma from '../config/db.js';

// Check if operator exists in DB
export const isValidOperador = async (id) => {
  const op = await prisma.operador.findUnique({ where: { id } });
  return op !== null;
};

// Check if interaction type exists by name
export const isValidTipoInteraccion = async (nombre) => {
  const tipo = await prisma.tipoInteraccion.findUnique({ where: { nombre } });
  return tipo !== null;
};

// Validate ISO datetime string
export const isValidDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

// Calculate deviation percentage between real and expected duration
export const calculateDesvioPercentage = (real, esperado) => {
  if (!esperado || esperado === 0) return 0;
  return ((real - esperado) / esperado) * 100;
};

// Determine alert state based on deviation percentage
export const getEstadoAlerta = (desvio_porcentaje) => {
  const abs = Math.abs(desvio_porcentaje);
  if (abs <= 20) return 'normal';
  return desvio_porcentaje > 0 ? 'lento' : 'rapido';
};
