import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Metric card component
 * @param {object} props - { label, valor, unidad, cambio, estado, icono }
 */
export const CardMetrica = ({ label, valor, unidad, cambio, estado = 'neutral', icono: Icon }) => {
  const estadoStyles = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-gray-700 bg-gray-800/50',
  };

  const textColorEstado = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const isPositiveTrend = cambio && parseFloat(cambio) > 0;

  return (
    <div className={`card border ${estadoStyles[estado]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{valor}</span>
            {unidad && <span className="text-lg text-gray-400">{unidad}</span>}
          </div>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${textColorEstado[estado]}`} />}
      </div>

      {cambio && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-700/50">
          {isPositiveTrend ? (
            <TrendingUp className="w-4 h-4 text-red-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          )}
          <span className={isPositiveTrend ? 'text-red-400' : 'text-emerald-400'}>{cambio}</span>
          <span className="text-xs text-gray-500">vs promedio</span>
        </div>
      )}
    </div>
  );
};

export default CardMetrica;
