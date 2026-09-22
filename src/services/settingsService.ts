import type { WorkspaceSettings } from '../types'

const SETTINGS_KEY = 'leadforge:settings'

export const defaultSettings: WorkspaceSettings = {
  workspaceName: 'LeadForge Pro',
  currency: 'BRL',
  defaultPotentialValue: 6000,
  defaultResultLimit: 20,
  searchProvider: 'mock',
  endpointUrl: '',
  compactMode: false,
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) } as WorkspaceSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: WorkspaceSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
