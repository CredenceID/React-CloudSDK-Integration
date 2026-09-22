import { getDocRequestApi } from "@/api/services/iso18013Service";
import type { GetDocRequestResponse } from "@/api/types/iso18013Service";

// iOS requires navigator.credentials.get() to run inside the same user-
// gesture task. Awaiting the getDocRequest fetch between the click and
// get() crosses a task boundary, which strict WebKit engines reject with
// NotAllowedError. Warm this on pointerdown so the click handler can hand
// an already-resolved request straight to navigator.credentials.get() with
// no network round-trip in between.
let cached: {
  accessToken: string;
  promise: Promise<GetDocRequestResponse>;
  ts: number;
} | null = null;

const REUSE_WINDOW_MS = 60_000;

function isFresh(accessToken: string): boolean {
  return (
    !!cached &&
    cached.accessToken === accessToken &&
    performance.now() - cached.ts < REUSE_WINDOW_MS
  );
}

// Best-effort warm-up — call from a pointerdown handler. Reuses a recent
// prefetch for the same token instead of spawning a fresh server session
// on every pointer event.
export function prefetchDocRequest(accessToken: string): void {
  if (isFresh(accessToken)) return;
  cached = { accessToken, ts: performance.now(), promise: getDocRequestApi(accessToken) };
}

// Consumes the pending prefetch for this token if one is warm, otherwise
// fetches fresh. Always clears the cache afterward — the next attempt warms
// a new session rather than replaying a stale one.
export function consumeDocRequestPrefetch(
  accessToken: string,
): Promise<GetDocRequestResponse> {
  const promise = isFresh(accessToken) ? cached!.promise : getDocRequestApi(accessToken);
  cached = null;
  return promise;
}
