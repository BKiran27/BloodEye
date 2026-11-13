import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Helper hook to perform API calls with demo data fallback
export function useApi<T>(
  endpoint: string, 
  demoData?: T, 
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
      setError(null);
    } catch (err) {
      if (demoData !== undefined) {
        // Fallback to demo data when backend is not responding or in demo mode
        setData(demoData);
        setError(null);
      } else {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, demoData, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
