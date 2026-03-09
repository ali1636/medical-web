// hooks/useToast.js
'use client';
import { useState, useCallback } from 'react';

/**
 * useToast — manages a single toast notification.
 * Returns: { toast, showToast, clearToast }
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}