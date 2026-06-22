const STORAGE_KEY = 'margawise_data'

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetData(seed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}
