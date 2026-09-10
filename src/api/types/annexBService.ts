export type AnnexBInitiateResponse = {
  sessionId: string;
  walletUri: string;  // mdoc-openid4vp://… — render as QR or open as deep link
  requestUri: string; // opaque to client code
};

export type AnnexBResultResponse = {
  success: boolean;
  // Stringified JSON of `{ identity, authentication, documents? }` — same
  // shape as ResDetails (iso18013Service), parse with JSON.parse.
  identity: string | null;
  error: string | null;    // failure reason; null when success is true
};
