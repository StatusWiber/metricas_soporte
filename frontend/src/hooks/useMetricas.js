import { useState, useEffect } from 'react';
import { getMetricasEquipo } from '../services/api';

/**
 * Hook for fetching team metrics
 * @param {string} fecha - Date filter (YYYY-MM-DD)
 * @returns {{ metricas, loading, error, refresh }}
 */
export const useMetricas = (fecha = null) => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMetricasEquipo(fecha);
      setMetricas(response.data);
    } catch (err) {
      setError(err.message || 'Error loading metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetricas, 30000);
    return () => clearInterval(interval);
  }, [fecha]);

  return { metricas, loading, error, refresh: fetchMetricas };
};

export default useMetricas;
