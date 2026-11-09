import { useSyncExternalStore } from 'react';

/**
 * Reads Orbit AI's answers aloud. Orbit speaks from main with the Mac's own voices (nothing is
 * sent anywhere), so it carries on whichever page shows the answer; this follows what it's
 * reading (Settings → Voice). One answer at a time; a new question, Stop or Esc ends it.
 * Answers to spoken questions are read by main on its own.
 */
let speakingId: string | null = null;
const listeners = new Set<() => void>();
let following = false;

type VoiceLike = { speaking: string | null };
const orbit = window.orbit;

function follow(): void {
  if (following) return;
  following = true;
  const read = (v: VoiceLike) => {
    const next = v.speaking ?? null;
    if (next === speakingId) return;
    speakingId = next;
    listeners.forEach((l) => l());
  };
  orbit.on('voice:update', read);
  void orbit.invoke('voice:get', {}).then(read);
}

export function speak(id: string, text: string): void {
  if (!text.trim()) return;
  void orbit.invoke('voice:speak', { id, text });
}

export function stopSpeaking(): void {
  void orbit.invoke('voice:stopSpeaking', {});
}

export function useSpeakingId(): string | null {
  follow();
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => speakingId,
  );
}
