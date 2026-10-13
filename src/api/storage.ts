import { useEffect, useState } from 'react';

function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(`jagyeok:${key}`) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));

  useEffect(() => {
    localStorage.setItem(`jagyeok:${key}`, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function useSessionStored<T>(key: string, initial: T) {
  const storageKey = `jagyeok:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey) || 'null') ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Keep the current page state when browser storage is unavailable.
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
