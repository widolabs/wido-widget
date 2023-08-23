export function createLocalStorageHandlers<T>(key: string) {
  return {
    saveToLocalStorage: (data: T): void => {
      try {
        const serializedData = JSON.stringify(data)
        localStorage.setItem(key, serializedData)
      } catch {
        //
      }
    },

    getFromLocalStorage: (): T | undefined => {
      try {
        const serializedData = localStorage.getItem(key)
        if (serializedData === null) return undefined
        return JSON.parse(serializedData) as T
      } catch {
        return undefined
      }
    },
  }
}
