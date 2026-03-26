import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCapacidadOperador, getDesviosOperador, getGestionesOperador } from '../services/api';
import { formatMinutos, formatDesvio, formatCapacidad, getColorCapacidad } from '../utils/formatters';

/**
 * Operator Detail Page
 */
export const DetalleOperador = () => {
  const { operador_id } = useParams();
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(null);
  const [capacidad, setCapacidad] = useState(null);
  const [desvios, setDesvios] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [capRes, desviosRes, gestionsRes] = await Promise.all([
          getCapacidadOperador(operador_id, fecha),
          getDesviosOperador(operador_id, fecha),
          getGestionesOperador(operador_id, fecha),
        ]);

        setCapacidad(capRes.data);
        setDesvios(desviosRes.data.desvios || []);
        setGestiones(gestionsRes.data.gestiones || []);
      } catch (err) {
        setError(err.message || 'Error loading operator data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [operador_id, fecha]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">Cargando detalles del operador...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar fecha={fecha} onDateChange={setFecha} isOnline={!error} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{operador_id.replace('OPE-', '')}</h1>
              <p className="text-gray-400">Detalles de operador</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 mb-8">
            {error}
          </div>
        )}

        {/* Capacity Status */}
        {capacidad && (
          <div className={`card mb-8 border-l-4 border-gray-700 ${getColorCapacidad(capacidad.capacidad)}`}>
            <h2 className="text-lg font-bold mb-4">Estado de Capacidad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Capacidad</p>
                <p className="text-2xl font-bold text-white">{formatCapacidad(capacidad.capacidad)}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Desvío Promedio</p>
                <p className={`text-2xl font-bold ${capacidad.desvio_promedio > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatDesvio(capacidad.desvio_promedio)}
                </p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Interacciones</p>
                <p className="text-2xl font-bold text-white">{capacidad.interacciones_hoy}</p>
              </div>
            </div>
          </div>
        )}

        {/* Deviations */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Desvíos del Día</h2>
          {desvios.length > 0 ? (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400">Tipo</th>
                    <th className="px-4 py-3 text-left text-gray-400">Real</th>
                    <th className="px-4 py-3 text-left text-gray-400">Esperado</th>
                    <th className="px-4 py-3 text-left text-gray-400">Desvío</th>
                    <th className="px-4 py-3 text-left text-gray-400">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {desvios.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-700/20">
                      <td className="px-4 py-3">{d.tipo_interaccion?.nombre}</td>
                      <td className="px-4 py-3 font-mono text-cyan-400">{formatMinutos(d.duracion_real_minutos)}</td>
                      <td className="px-4 py-3 font-mono text-gray-400">{formatMinutos(d.promedio_esperado_minutos)}</td>
                      <td className="px-4 py-3 font-mono font-bold">{formatDesvio(d.desvio_porcentaje)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                          d.estado_alerta === 'normal'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : d.estado_alerta === 'lento'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {d.estado_alerta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card text-center text-gray-400">Sin desvíos registrados</div>
          )}
        </div>

        {/* Recent Interactions */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Interacciones Recientes</h2>
          {gestiones.length > 0 ? (
            <div className="card divide-y divide-gray-700/50">
              {gestiones.slice(0, 10).map((g) => (
                <div key={g.id} className="px-4 py-4 hover:bg-gray-700/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{g.tipo_interaccion?.nombre}</p>
                      <p className="text-sm text-gray-400">{new Date(g.timestamp_inicio).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-cyan-400">{formatMinutos(g.duracion_minutos)}</p>
                      <p className="text-sm text-gray-400">{g.estado}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center text-gray-400">Sin interacciones registradas</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetalleOperador;
