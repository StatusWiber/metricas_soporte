import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MetricasEquipo from '../components/MetricasEquipo';
import GraficosRealtime from '../components/GraficosRealtime';
import DesviosTable from '../components/DesviosTable';
import AlertasPanel from '../components/AlertasPanel';
import OperadorCard from '../components/OperadorCard';
import useMetricas from '../hooks/useMetricas';
import { getDesvios } from '../services/api';

/**
 * Home / Dashboard Page
 */
export const Home = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(null);
  const [desvios, setDesvios] = useState([]);
  const [desviosLoading, setDesviosLoading] = useState(false);

  const { metricas, loading: metricsLoading, error: metricsError } = useMetricas(fecha);

  // Fetch deviations when metrics change
  React.useEffect(() => {
    const fetchDesvios = async () => {
      if (!metricas) return;
      try {
        setDesviosLoading(true);
        const response = await getDesvios(null, fecha, null);
        setDesvios(response.data.desvios || []);
      } catch (err) {
        console.error('Error fetching deviations:', err);
        setDesvios([]);
      } finally {
        setDesviosLoading(false);
      }
    };
    fetchDesvios();
  }, [metricas, fecha]);

  const handleOperadorClick = (operadorId) => {
    navigate(`/operador/${operadorId}`, { state: { fecha } });
  };

  const alertas = [];
  if (metricas?.operadores) {
    metricas.operadores.forEach((op) => {
      // Simulate alerts from deviations
      if (Math.abs(op.desvio_promedio) > 20) {
        alertas.push({
          id: `alerta-${op.operador_id}`,
          operador_id: op.operador_id,
          tipo_alerta: 'desvio_alto',
          mensaje: `${op.nombre}: Desvío ${op.desvio_promedio.toFixed(1)}% en el día`,
          created_at: new Date(),
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar fecha={fecha} onDateChange={setFecha} isOnline={!metricsError} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Rendimiento</h1>
          <p className="text-gray-400">Monitoreo en tiempo real del equipo de soporte</p>
        </div>

        {/* Main Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Métricas Principales</h2>
          {metricsLoading ? (
            <div className="text-center py-8 text-gray-400">Cargando métricas...</div>
          ) : metricsError ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
              Error: {metricsError}
            </div>
          ) : (
            <MetricasEquipo metricas={metricas} />
          )}
        </section>

        {/* Charts and Deviations */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Análisis de Datos</h2>
            <GraficosRealtime metricas={metricas} loading={metricsLoading} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Estado</h2>
            <AlertasPanel alertas={alertas} loading={false} />
          </div>
        </section>

        {/* Deviations Table */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Desvíos del Día</h2>
          <DesviosTable desvios={desvios} loading={desviosLoading} />
        </section>

        {/* Operators Cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Estado de Operadores</h2>
          {metricsLoading ? (
            <div className="text-center py-8 text-gray-400">Cargando operadores...</div>
          ) : metricas?.operadores && metricas.operadores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricas.operadores.map((op) => (
                <OperadorCard
                  key={op.operador_id}
                  operador_id={op.operador_id}
                  nombre={op.nombre}
                  capacidad={op.capacidad}
                  desvio_promedio={op.desvio_promedio}
                  interacciones_hoy={op.interacciones_hoy}
                  alertas_count={op.alertas_count || 0}
                  mttr_real_minutos={op.mttr_real_minutos}
                  onClick={() => handleOperadorClick(op.operador_id)}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center text-gray-400">Sin datos de operadores</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
