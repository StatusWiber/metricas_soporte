import { useState, useEffect } from 'react';
import { getMetricasEquipo } from '../services/api';

/**
 * Hook for fetching list of operators from team metrics
 * @returns {{ operadores, loading, error }}
 */
export const useOperadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOperadores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMetricasEquipo();
        const ops = response.data.operadores || [];
        setOperadores(ops);
      } catch (err) {
        setError(err.message || 'Error loading operators');
        setOperadores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

  return { operadores, loading, error };
};

export default useOperadores;
