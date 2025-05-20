import { useCallback } from 'react';

export const useLocalStorage = () => {
  const fetchLocal = useCallback(async key => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`useLocalStorage: failed to fetch key "${key}"`, e);
      return null;
    }
  }, []);

  const saveLocal = useCallback(async (key, value) => {
    try {
      const json = JSON.stringify(value);
      window.localStorage.setItem(key, json);
    } catch (e) {
      console.error(`useLocalStorage: failed to save key "${key}"`, e);
    }
  }, []);

  const deleteLocal = useCallback(async key => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(`useLocalStorage: failed to delete key "${key}"`, e);
    }
  }, []);

  return { fetchLocal, saveLocal, deleteLocal };
};
