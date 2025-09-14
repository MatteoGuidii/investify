'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalDismiss(key: string): [boolean, () => void, () => void] {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to avoid SSR hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load dismissed state from localStorage on mount
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const stored = localStorage.getItem(key);
      setDismissed(stored === 'true');
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      setDismissed(false);
    }
  }, [key, isClient]);

  // Dismiss function - sets state and persists to localStorage
  const dismiss = useCallback(() => {
    if (!isClient) return;
    
    try {
      localStorage.setItem(key, 'true');
      setDismissed(true);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      // Still update state even if localStorage fails
      setDismissed(true);
    }
  }, [key, isClient]);

  // Reset function - clears state and removes from localStorage
  const reset = useCallback(() => {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(key);
      setDismissed(false);
    } catch (error) {
      console.warn('Failed to clear from localStorage:', error);
      // Still update state even if localStorage fails
      setDismissed(false);
    }
  }, [key, isClient]);

  return [dismissed, dismiss, reset];
}
