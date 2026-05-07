export type AnnexBInitiateResponse = {
  sessionId: string;
  walletUri: string;  // mdoc-openid4vp://… — render as QR or open as deep link
  requestUri: string; // opaque to client code
};

export type AnnexBResultResponse = {
  success: boolean;
  identity: string | null; // stringified JSON of verified mdoc claims
  error: string | null;    // failure reason; null when success is true
};
