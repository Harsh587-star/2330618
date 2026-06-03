import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://4.224.186.213/evaluation-service/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE, { params });
      const data = response.data?.notifications || [];
      setNotifications(data);
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch notifications. Please try again.'
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { notifications, loading, error, fetchNotifications };
}

// Priority weights same as backend
const PRIORITY_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function getTopNByPriority(notifications, n) {
  return [...notifications]
    .sort((a, b) => {
      const weightA = PRIORITY_WEIGHT[a.Type] || 0;
      const weightB = PRIORITY_WEIGHT[b.Type] || 0;
      if (weightB !== weightA) return weightB - weightA;
      // Same type → sort by recency
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    })
    .slice(0, n);
}
