import React from 'react';
import { AlertCircle, User, TrendingUp, Zap } from 'lucide-react';
import { formatMinutos, formatDesvio, getColorCapacidad } from '../utils/formatters';

/**
 * Operator card component
 * @param {object} props - { operador_id, nombre, capacidad, desvio_promedio, interacciones_hoy, alertas_count, mttr_real_minutos, onClick }
 */
export const OperadorCard = ({
  operador_id,
  nombre,
  capacidad = 'SIN DATOS',
  desvio_promedio = 0,
  interacciones_hoy = 0,
  alertas_count = 0,
  mttr_real_minutos = 0,
  onClick,
}) => {
  const hasAlerts = alertas_count > 0;
  const isSaturated = capacidad === 'SATURADO';

  return (
    <div
      onClick={onClick}
      className="card border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800 cursor-pointer transition-all animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{nombre}</h3>
            <p className="text-xs text-gray-500">{operador_id}</p>
          </div>
        </div>
        {hasAlerts && (
          <div className="bg-red-500/20 rounded-full p-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
        )}
      </div>

      {/* Capacity status */}
      <div className={`rounded-lg px-3 py-2 mb-4 ${getColorCapacidad(capacidad)}`}>
        <p className="text-sm font-semibold">{capacidad}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-gray-700/50 rounded px-3 py-2">
          <p className="text-xs text-gray-400">MTTR Real</p>
          <p className="font-mono text-lg text-white">{formatMinutos(mttr_real_minutos)}</p>
        </div>
        <div className="bg-gray-700/50 rounded px-3 py-2">
          <p className="text-xs text-gray-400">Desvío</p>
          <p className={`font-mono text-lg ${desvio_promedio > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatDesvio(desvio_promedio)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4" />
          <span>{interacciones_hoy} interacciones</span>
        </div>
        {hasAlerts && (
          <div className="flex items-center gap-1 text-red-400 font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{alertas_count} alertas</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperadorCard;
