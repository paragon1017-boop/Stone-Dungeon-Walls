// Simple local save/load for MVP. Replace with server-backed save in production.
export const SAVE_KEY = 'stone-dungeon-save-v1'

export function saveGameData(data: any): void {
  try {
    const payload = JSON.stringify(data)
    localStorage.setItem(SAVE_KEY, payload)
  } catch (e) {
    console.error('Failed to save game', e)
  }
}

export function loadGameData(): any | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load game', e)
    return null
  }
}
