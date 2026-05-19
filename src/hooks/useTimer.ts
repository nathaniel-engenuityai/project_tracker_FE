import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  onStop: (id: string, elapsedMinutes: number) => void;
}

export const useTimer = ({ onStop }: UseTimerProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  activeIdRef.current = activeId;

  const stop = useCallback(() => {
    const currentId = activeIdRef.current;
    if (!currentId || !startTimeRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const minutesElapsed = Math.max(1, Math.round(secondsElapsed / 60));
    onStop(currentId, minutesElapsed);
    setElapsed((prev) => ({ ...prev, [currentId]: 0 }));
    setActiveId(null);
    startTimeRef.current = null;
  }, [onStop]);

  const start = useCallback((id: string) => {
    if (activeIdRef.current) stop();
    setActiveId(id);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed((prev) => ({ ...prev, [id]: secondsElapsed }));
      }
    }, 1000);
  }, [stop]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentId = activeIdRef.current;
      if (currentId && startTimeRef.current) {
        const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutesElapsed = Math.max(1, Math.round(secondsElapsed / 60));
        onStop(currentId, minutesElapsed);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [onStop]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return { activeId, elapsed, start, stop, isRunning: (id: string) => activeId === id };
};