// Format minutes to HH:MM format
export const formatMinutos = (minutos) => {
  if (!minutos) return '0:00';
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  if (horas > 0) {
    return `${horas}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins} min`;
};

// Format percentage with sign
export const formatDesvio = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return '—';
  const sign = porcentaje > 0 ? '+' : '';
  return `${sign}${porcentaje.toFixed(1)}%`;
};

// Format capacity status with color
export const formatCapacidad = (valor) => {
  const upper = valor?.toUpperCase();
  return upper || 'SIN DATOS';
};

// Get color for capacity status
export const getColorCapacidad = (capacidad) => {
  const cap = capacidad?.toUpperCase();
  switch (cap) {
    case 'NORMAL':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'SATURADO':
      return 'bg-red-500/20 text-red-400';
    case 'CAPACIDAD LIBRE':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-700/50 text-gray-400';
  }
};

// Get color for alert state
export const getColorEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'normal':
      return 'text-emerald-400';
    case 'lento':
      return 'text-red-400';
    case 'rapido':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

// Get background color for alert state
export const getBgColorEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'normal':
      return 'bg-emerald-500/10 border-emerald-500/30';
    case 'lento':
      return 'bg-red-500/10 border-red-500/30';
    case 'rapido':
      return 'bg-blue-500/10 border-blue-500/30';
    default:
      return 'bg-gray-700/50 border-gray-600/50';
  }
};

// Format date to readable string
export const formatFecha = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatFechaHora = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get relative time (hace X minutos, hace X horas, etc.)
export const getRelativeTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'min' : 'mins'}`;
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

  return formatFecha(date);
};

// Format number with thousands separator
export const formatNumero = (num) => {
  if (typeof num !== 'number') return '—';
  return num.toLocaleString('es-AR');
};
