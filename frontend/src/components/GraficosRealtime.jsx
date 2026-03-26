import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Real-time graphics component
 * @param {object} props - { metricas, loading }
 */
export const GraficosRealtime = ({ metricas = null, loading = false }) => {
  if (loading || !metricas) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400">Cargando gráficos...</p>
      </div>
    );
  }

  // Data for pie chart (interactions by type)
  const pieData = (metricas.interacciones_por_tipo || []).map((t) => ({
    name: t.tipo,
    value: t.cantidad,
  }));

  // Data for bar chart (deviations by operator)
  const barData = (metricas.operadores || []).map((op) => ({
    name: op.nombre.substring(0, 8),
    desvio: parseFloat(op.desvio_promedio.toFixed(2)),
    capacidad: op.capacidad,
  }));

  const COLORS = ['#06b6d4', '#0d9488', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded p-2">
          <p className="text-sm text-white font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-cyan-400">{payload[0].value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart: Deviations by Operator */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Desvío % por Operador (hoy)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'Desvío %', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
            />
            <Bar dataKey="desvio" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Interactions by Type */}
      {pieData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Distribución de Interacciones por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-cyan-500/5 border-cyan-500/30">
          <p className="text-sm text-cyan-400 mb-2">MTTR Real</p>
          <p className="text-2xl font-bold text-white">
            {metricas.mttr_real_minutos?.toFixed(2) || '—'} min
          </p>
        </div>
        <div className="card bg-teal-500/5 border-teal-500/30">
          <p className="text-sm text-teal-400 mb-2">MTTR Esperado</p>
          <p className="text-2xl font-bold text-white">
            {metricas.mttr_esperado_minutos?.toFixed(2) || '—'} min
          </p>
        </div>
        <div className={`card border-l-4 ${metricas.desvio_general_porcentaje > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
          <p className={`text-sm mb-2 ${metricas.desvio_general_porcentaje > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            Desvío General
          </p>
          <p className={`text-2xl font-bold ${metricas.desvio_general_porcentaje > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {metricas.desvio_general_porcentaje?.toFixed(1) || '—'}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraficosRealtime;
