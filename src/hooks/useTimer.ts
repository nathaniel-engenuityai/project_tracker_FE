import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  onStop: (elapsedMinutes: number) => void;
}

export const useTimer = ({ onStop }: UseTimerProps) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback((projectId: string) => {
    if (activeProjectId && activeProjectId !== projectId) {
      stop();
    }
    setActiveProjectId(projectId);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed((prev) => ({ ...prev, [projectId]: secondsElapsed }));
      }
    }, 1000);
  }, [activeProjectId]);

  const stop = useCallback(() => {
    if (!activeProjectId || !startTimeRef.current) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const minutesElapsed = Math.max(1, Math.round(secondsElapsed / 60));

    onStop(minutesElapsed);

    setElapsed((prev) => ({ ...prev, [activeProjectId]: 0 }));
    setActiveProjectId(null);
    startTimeRef.current = null;
  }, [activeProjectId, onStop]);

  // Save time on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeProjectId && startTimeRef.current) {
        const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutesElapsed = Math.max(1, Math.round(secondsElapsed / 60));
        onStop(minutesElapsed);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeProjectId, onStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    activeProjectId,
    elapsed,
    start,
    stop,
    isRunning: (projectId: string) => activeProjectId === projectId,
  };
};