import React from 'react';
import { AlertCircle, Zap, X } from 'lucide-react';
import { getRelativeTime } from '../utils/formatters';

/**
 * Alerts panel component
 * @param {object} props - { alertas[], loading }
 */
export const AlertasPanel = ({ alertas = [], loading = false }) => {
  const [leidas, setLeidas] = React.useState(new Set());

  const handleMarkAsRead = (alertaId) => {
    setLeidas((prev) => new Set([...prev, alertaId]));
  };

  if (loading) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400">Cargando alertas...</p>
      </div>
    );
  }

  const alertasActivas = alertas.filter((a) => !leidas.has(a.id));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Alertas Activas
        </h3>
        {alertasActivas.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {alertasActivas.length}
          </span>
        )}
      </div>

      {alertasActivas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>✓ Sin alertas activas</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alertasActivas.map((alerta) => {
            const isRecent = new Date() - new Date(alerta.created_at) < 3600000; // < 1 hour
            return (
              <div
                key={alerta.id}
                className={`p-3 rounded-lg border-l-4 border-red-500 bg-red-500/10 hover:bg-red-500/15 transition-colors ${
                  isRecent ? 'ring-1 ring-red-500/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="font-semibold text-red-400 text-sm">{alerta.tipo_alerta.toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-gray-200">{alerta.mensaje}</p>
                    <p className="text-xs text-gray-500 mt-1">{getRelativeTime(alerta.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleMarkAsRead(alerta.id)}
                    className="text-gray-500 hover:text-gray-300 flex-shrink-0 transition-colors"
                    title="Marcar como leída"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertasPanel;
