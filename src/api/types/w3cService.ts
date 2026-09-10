export type W3CInitiateResponse = {
  sessionId: string;
  authorizationRequest: {
    client_id: string;
    [key: string]: unknown;
  };
  callbackUrl: string;
  requestUri: string;
};

export type W3CVerificationDetails = {
  vpSignatureValid: boolean;
  vcSignatureValid: boolean;
  nonceMatches: boolean;
  audienceMatches: boolean;
  issuerTrusted: boolean;
  notExpired: boolean;
  credentialTypeMatches: boolean;
};

// One entry per credential when the wallet presented more than one document
// (multi-document profile).
export type W3CDocumentResult = {
  credentialType: string[] | null;
  claims: Record<string, unknown> | null;
  verificationDetails: W3CVerificationDetails | null;
  success?: boolean;
};

export type W3CResultResponse = {
  success: boolean;
  claims: Record<string, unknown> | null;
  issuer: string | null;
  issuanceDate: string | null;
  expirationDate: string | null;
  credentialType: string[] | null;
  verificationDetails: W3CVerificationDetails | null;
  error: string | null;
  // Mirrors the top-level fields for the first document; present only for
  // multi-document presentations.
  documents?: W3CDocumentResult[] | null;
};
