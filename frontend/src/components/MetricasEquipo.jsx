import React from 'react';
import { Activity, TrendingUp, Users, Zap, AlertCircle, Clock } from 'lucide-react';
import CardMetrica from './CardMetrica';
import { formatMinutos, formatDesvio } from '../utils/formatters';

/**
 * Team metrics component - displays main KPIs
 * @param {object} props - { metricas }
 */
export const MetricasEquipo = ({ metricas = null }) => {
  if (!metricas) return null;

  const mttrReal = metricas.mttr_real_minutos || 0;
  const mttrEsperado = metricas.mttr_esperado_minutos || 0;
  const desvioGeneral = metricas.desvio_general_porcentaje || 0;
  const totalInteracciones = metricas.total_interacciones || 0;
  const operadores = metricas.operadores || [];
  const alertasCount = operadores.reduce((sum, op) => sum + (op.alertas_count || 0), 0);

  const capacidadPromedio =
    operadores.length > 0
      ? operadores.reduce((sum, op) => sum + (op.desvio_promedio || 0), 0) / operadores.length
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardMetrica
        label="MTTR Real"
        valor={formatMinutos(mttrReal)}
        unidad="min"
        cambio={formatDesvio(desvioGeneral)}
        estado={Math.abs(desvioGeneral) > 20 ? 'danger' : desvioGeneral > 0 ? 'warning' : 'success'}
        icono={Clock}
      />

      <CardMetrica
        label="MTTR Promedio"
        valor={formatMinutos(mttrEsperado)}
        unidad="min"
        estado="neutral"
        icono={TrendingUp}
      />

      <CardMetrica
        label="Desvío General"
        valor={desvioGeneral.toFixed(1)}
        unidad="%"
        estado={Math.abs(desvioGeneral) > 20 ? 'danger' : desvioGeneral > 0 ? 'warning' : 'success'}
        icono={AlertCircle}
      />

      <CardMetrica
        label="Total Interacciones"
        valor={totalInteracciones}
        unidad="hoy"
        estado="neutral"
        icono={Zap}
      />

      <CardMetrica
        label="Capacidad Promedio"
        valor={capacidadPromedio.toFixed(1)}
        unidad="%"
        estado={Math.abs(capacidadPromedio) > 15 ? 'warning' : 'success'}
        icono={Activity}
      />

      <CardMetrica
        label="Alertas Activas"
        valor={alertasCount}
        unidad="alertas"
        estado={alertasCount > 0 ? 'danger' : 'success'}
        icono={AlertCircle}
      />
    </div>
  );
};

export default MetricasEquipo;
