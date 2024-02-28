import { useCallback, useState } from "react"

// stolen from https://github.com/microsoft/TypeScript/issues/37663#issuecomment-606110995
type Initializer<T> = T extends Function ? never : (T | (() => T))
export function useLocalStorageState<T>(key: string, fallbackState?: Initializer<T>) {
  return usePersistedState<T>(window.localStorage, key, fallbackState)
}

export function useSessionStorageState<T>(key: string, fallbackState?: Initializer<T>) {
  return usePersistedState<T>(window.sessionStorage, key, fallbackState)
}

function usePersistedState<T>(store: Storage, key: string, fallbackState?: Initializer<T>): [T, StateUpdater<T>] {
  const [state, updateState] = useState<T>(() => {
    const savedItem = store.getItem(key)
    if (savedItem) {
      return JSON.parse(savedItem)
    } else {
      return (typeof fallbackState == 'function' ? fallbackState() : fallbackState)
    }
  })

  // The key really ought not change, but it will be less bad if we start writing to a new location than
  // if we keep writing to the old one
  const customSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    updateState((valueWas) => {
      const computedValue = newValue instanceof Function ? newValue(valueWas) : newValue;
      store.setItem(key, JSON.stringify(computedValue));
      return computedValue;
    })
  }, [key]);

  return [state, customSetValue]
}