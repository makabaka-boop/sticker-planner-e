import type { ThemeRecord } from '@/types'

const STORAGE_KEY = 'sticker-planner-data'

export function loadFromStorage(): ThemeRecord[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return null
}

export function saveToStorage(themes: ThemeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}
