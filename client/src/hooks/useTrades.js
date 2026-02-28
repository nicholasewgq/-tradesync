import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/trades?${queryParams}` : '/trades';
      const response = await api.get(url);
      setTrades(response.data.trades);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrade = async (tradeData) => {
    const response = await api.post('/trades', tradeData);
    setTrades(prev => [response.data, ...prev]);
    return response.data;
  };

  const updateTrade = async (id, tradeData) => {
    const response = await api.put(`/trades/${id}`, tradeData);
    setTrades(prev => prev.map(t => t.id === id ? response.data : t));
    return response.data;
  };

  const deleteTrade = async (id) => {
    await api.delete(`/trades/${id}`);
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return {
    trades,
    loading,
    error,
    fetchTrades,
    createTrade,
    updateTrade,
    deleteTrade
  };
}
