import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MetricasEquipo from '../components/MetricasEquipo';
import GraficosRealtime from '../components/GraficosRealtime';
import DesviosTable from '../components/DesviosTable';
import AlertasPanel from '../components/AlertasPanel';
import OperadorCard from '../components/OperadorCard';

// Mock data for testing without backend
const MOCK_METRICAS = {
  fecha: new Date().toISOString().split('T')[0],
  mttr_real_minutos: 4.5,
  mttr_esperado_minutos: 4.2,
  desvio_general_porcentaje: 7.1,
  total_interacciones: 68,
  operadores: [
    { operador_id: 'OPE-CRISTIAN', nombre: 'CRISTIAN', capacidad: 'NORMAL', desvio_promedio: 5.2, interacciones_hoy: 18, alertas_count: 0, mttr_real_minutos: 4.3 },
    { operador_id: 'OPE-ROCIO', nombre: 'ROCIO', capacidad: 'SATURADO', desvio_promedio: 22.5, interacciones_hoy: 15, alertas_count: 1, mttr_real_minutos: 5.1 },
    { operador_id: 'OPE-NICOLAS', nombre: 'NICOLÁS', capacidad: 'NORMAL', desvio_promedio: -8.3, interacciones_hoy: 20, alertas_count: 0, mttr_real_minutos: 3.9 },
    { operador_id: 'OPE-GUSTAVO', nombre: 'GUSTAVO', capacidad: 'CAPACIDAD LIBRE', desvio_promedio: -18.5, interacciones_hoy: 15, alertas_count: 0, mttr_real_minutos: 3.4 },
  ],
  interacciones_por_tipo: [
    { tipo: 'SIN INTERNET', cantidad: 22, mttr_real: 3.8, mttr_esperado: 3.83, desvio_porcentaje: -0.8 },
    { tipo: 'CONSULTAS ADICIONALES', cantidad: 18, mttr_real: 3.5, mttr_esperado: 3.73, desvio_porcentaje: -6.2 },
    { tipo: 'TV', cantidad: 15, mttr_real: 5.2, mttr_esperado: 4.35, desvio_porcentaje: 19.5 },
    { tipo: 'INTERMITENCIAS / LENTITUD', cantidad: 10, mttr_real: 5.8, mttr_esperado: 5.22, desvio_porcentaje: 11.1 },
    { tipo: 'DERIVACIÓN DE CHAT', cantidad: 3, mttr_real: 0.7, mttr_esperado: 0.67, desvio_porcentaje: 4.5 },
  ]
};

/**
 * Home / Dashboard Page
 */
export const Home = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(null);
  const [metricas] = useState(MOCK_METRICAS);
  const metricsLoading = false;
  const metricsError = null;
  const desvios = [];
  const desviosLoading = false;

  // Removed useEffect - using mock data instead

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
