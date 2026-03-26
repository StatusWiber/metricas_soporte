import React, { useState } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { formatMinutos, formatDesvio, getColorEstado } from '../utils/formatters';

/**
 * Deviations table component
 * @param {object} props - { desvios[], loading, operadores[] }
 */
export const DesviosTable = ({ desvios = [], loading = false, operadores = [] }) => {
  const [sortKey, setSortKey] = useState('desvio_porcentaje');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedDesvios = [...desvios].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400">Cargando desvíos...</p>
      </div>
    );
  }

  if (!desvios || desvios.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400">Sin desvíos registrados hoy</p>
      </div>
    );
  }

  const SortHeader = ({ label, sortKeyVal }) => (
    <th
      onClick={() => handleSort(sortKeyVal)}
      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-semibold text-gray-400">{label}</span>
        {sortKey === sortKeyVal && <ChevronDown className="w-4 h-4" />}
      </div>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <h3 className="text-lg font-bold mb-4">Desvíos del Día</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-700">
            <tr>
              <SortHeader label="Operador" sortKeyVal="operador" />
              <SortHeader label="Tipo" sortKeyVal="tipo_interaccion" />
              <SortHeader label="Real" sortKeyVal="duracion_real_minutos" />
              <SortHeader label="Promedio" sortKeyVal="promedio_esperado_minutos" />
              <SortHeader label="Desvío %" sortKeyVal="desvio_porcentaje" />
              <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-gray-400">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {sortedDesvios.map((desvio) => (
              <tr
                key={desvio.id}
                className="hover:bg-gray-700/20 transition-colors border-gray-700/50"
              >
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {desvio.operador?.nombre || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {desvio.tipo_interaccion?.nombre || '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-cyan-400">
                  {formatMinutos(desvio.duracion_real_minutos)}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-400">
                  {formatMinutos(desvio.promedio_esperado_minutos)}
                </td>
                <td className={`px-4 py-3 text-sm font-bold font-mono ${getColorEstado(desvio.estado_alerta)}`}>
                  {formatDesvio(desvio.desvio_porcentaje)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {desvio.estado_alerta !== 'normal' && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs font-semibold uppercase ${getColorEstado(desvio.estado_alerta)}`}>
                      {desvio.estado_alerta}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesviosTable;
