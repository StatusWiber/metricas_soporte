import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Generic hook for fetching data from API
 * @param {string} url - API endpoint
 * @param {object} options - Options { interval: ms for auto-refresh }
 * @returns {{ data, loading, error, refresh }}
 */
export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh interval
    const interval = options.interval || 30000; // default 30s
    const timer = setInterval(fetchData, interval);

    return () => clearInterval(timer);
  }, [url, options.interval]);

  return { data, loading, error, refresh: fetchData };
};

export default useApi;
