import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect user inactivity and trigger callback
 * @param timeoutMs - Time in milliseconds before considering user inactive
 * @param onInactive - Callback to execute when user becomes inactive
 */
export function useInactivity(timeoutMs: number, onInactive: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onInactiveRef = useRef(onInactive);

  // Keep callback ref up to date
  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onInactiveRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Reset timeout on any user activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, true);
    });

    // Start the timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);
}

