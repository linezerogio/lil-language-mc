'use client';

import { DAILY_PLAYER_ID_STORAGE_KEY } from './daily';

function createPlayerId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateDailyPlayerId() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = window.localStorage.getItem(DAILY_PLAYER_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const playerId = createPlayerId();
    window.localStorage.setItem(DAILY_PLAYER_ID_STORAGE_KEY, playerId);
    return playerId;
  } catch {
    return createPlayerId();
  }
}
