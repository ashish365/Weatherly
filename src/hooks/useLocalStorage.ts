import { useState } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * @param key The localStorage key to store the value under
 * @param initialValue The initial value to use if no value exists in localStorage
 * @returns A stateful value and a function to update it
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Read value from localStorage or use initialValue
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      alert(`Error reading localStorage key "${key}": ${error}`);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      alert(`Error setting localStorage key "${key}": ${error}`);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage; 