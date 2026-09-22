import type { WorkspaceSettings } from '../types'

const SETTINGS_KEY = 'leadforge:settings'

export const defaultSettings: WorkspaceSettings = {
  workspaceName: 'LeadForge Pro',
  currency: 'BRL',
  defaultPotentialValue: 0,
  defaultResultLimit: 20,
  compactMode: false,
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw) as Partial<WorkspaceSettings>
    return {
      ...defaultSettings,
      ...parsed,
      defaultPotentialValue: 0,
    } as WorkspaceSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: WorkspaceSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
