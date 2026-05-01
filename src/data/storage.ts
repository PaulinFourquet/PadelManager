export type StorageAdapter<T> = {
  load: () => T | null;
  save: (value: T) => void;
  clear: () => void;
};

export const createLocalStorageAdapter = <T>(key: string): StorageAdapter<T> => ({
  load: () => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  save: (value) => window.localStorage.setItem(key, JSON.stringify(value)),
  clear: () => window.localStorage.removeItem(key),
});
