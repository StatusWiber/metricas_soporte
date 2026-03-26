import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertasPanel from '../components/AlertasPanel';
import { getDesvios } from '../services/api';
import { getRelativeTime } from '../utils/formatters';

/**
 * Alerts Page
 */
export const Alertas = () => {
  const [fecha, setFecha] = useState(null);
  const [desvios, setDesvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroOperador, setFiltroOperador] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDesvios(null, fecha, null, 'true');
        setDesvios(response.data.desvios || []);
      } catch (err) {
        setError(err.message || 'Error loading alerts');
        setDesvios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertas();
  }, [fecha]);

  // Filter deviations
  const alertas = desvios
    .filter((d) => {
      if (filtroOperador && d.operador?.id !== filtroOperador) return false;
      if (filtroEstado && d.estado_alerta !== filtroEstado) return false;
      return true;
    })
    .map((d) => ({
      id: d.id,
      operador_id: d.operador?.id,
      operador_nombre: d.operador?.nombre,
      tipo_alerta: 'desvio_alto',
      mensaje: `${d.operador?.nombre}: ${d.estado_alerta.toUpperCase()} en ${d.tipo_interaccion?.nombre} (${d.desvio_porcentaje.toFixed(1)}%)`,
      created_at: d.fecha,
      estado_alerta: d.estado_alerta,
      desvio: d.desvio_porcentaje,
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const operadores = [...new Set(desvios.map((d) => d.operador?.nombre).filter(Boolean))];
  const estadoOptions = ['lento', 'rapido', 'normal'];

  const stats = {
    total: alertas.length,
    lento: alertas.filter((a) => a.estado_alerta === 'lento').length,
    rapido: alertas.filter((a) => a.estado_alerta === 'rapido').length,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar fecha={fecha} onDateChange={setFecha} isOnline={!error} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Centro de Alertas</h1>
          <p className="text-gray-400">Monitoreo de desvíos y anomalías</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card border-l-4 border-red-500/50">
            <p className="text-sm text-gray-400 mb-2">TOTAL</p>
            <p className="text-3xl font-bold text-red-400">{stats.total}</p>
          </div>
          <div className="card border-l-4 border-red-500/50">
            <p className="text-sm text-red-400 mb-2">MÁS LENTO</p>
            <p className="text-3xl font-bold text-red-400">{stats.lento}</p>
          </div>
          <div className="card border-l-4 border-blue-500/50">
            <p className="text-sm text-blue-400 mb-2">MÁS RÁPIDO</p>
            <p className="text-3xl font-bold text-blue-400">{stats.rapido}</p>
          </div>
          <div className="card border-l-4 border-cyan-500/50">
            <p className="text-sm text-cyan-400 mb-2">HOY</p>
            <p className="text-3xl font-bold text-cyan-400">{new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 mb-8">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Operador</label>
              <select
                value={filtroOperador}
                onChange={(e) => setFiltroOperador(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                {operadores.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                {estadoOptions.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Alertas Registradas</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Cargando alertas...</div>
          ) : alertas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              ✓ Sin alertas con los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alerta.estado_alerta === 'lento'
                      ? 'border-red-500/50 bg-red-500/10'
                      : alerta.estado_alerta === 'rapido'
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-gray-600/50 bg-gray-700/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-white">{alerta.operador_nombre}</p>
                      <p className="text-sm text-gray-300 mt-1">{alerta.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-2">{getRelativeTime(alerta.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          alerta.estado_alerta === 'lento'
                            ? 'bg-red-500/20 text-red-400'
                            : alerta.estado_alerta === 'rapido'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}
                      >
                        {alerta.desvio > 0 ? '+' : ''}{alerta.desvio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Alertas;
