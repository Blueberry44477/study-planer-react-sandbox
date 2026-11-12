import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function readStorageValue<T>(
  key: string,
  fallbackValue: T,
  validate?: (value: unknown) => value is T
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallbackValue;
    }

    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) {
      console.warn(`Invalid data format in localStorage for key "${key}", using fallback.`);
      return fallbackValue;
    }

    return parsed as T;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}":`, error);
    return fallbackValue;
  }
}

export function writeStorageValue<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}":`, error);
    return false;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorageValue(key, initialValue, validate)
  );

  useEffect(() => {
    writeStorageValue(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
