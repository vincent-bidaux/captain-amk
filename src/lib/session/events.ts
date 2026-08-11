export const SESSIONS_CHANGED_EVENT = "captain-amk:sessions-changed";

export function notifySessionsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSIONS_CHANGED_EVENT));
  }
}
