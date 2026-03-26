import axios from 'axios';

const baseURL = '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API] ✗ Error:`, error.message);
    return Promise.reject(error);
  }
);

// API methods
export const getHealth = () => api.get('/health');

export const getMetricasEquipo = (fecha) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  return api.get('/gestiones/metricas/equipo', { params });
};

export const getGestionesOperador = (operadorId, fecha) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  return api.get(`/gestiones/operador/${operadorId}`, { params });
};

export const getCapacidadOperador = (operadorId, fecha) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  return api.get(`/gestiones/capacidad/${operadorId}`, { params });
};

export const getDesvios = (operadorId, fechaDesde, fechaHasta, alertaOnly) => {
  const params = {};
  if (operadorId) params.operador_id = operadorId;
  if (fechaDesde) params.fecha_desde = fechaDesde;
  if (fechaHasta) params.fecha_hasta = fechaHasta;
  if (alertaOnly) params.alerta_solo = alertaOnly;
  return api.get('/desvios', { params });
};

export const getDesviosOperador = (operadorId, fecha, tipoInteraccionId) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  if (tipoInteraccionId) params.tipo_interaccion_id = tipoInteraccionId;
  return api.get(`/desvios/operador/${operadorId}`, { params });
};

export default api;
