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

export type W3CResultResponse = {
  success: boolean;
  claims: Record<string, unknown> | null;
  issuer: string | null;
  issuanceDate: string | null;
  expirationDate: string | null;
  credentialType: string[] | null;
  verificationDetails: W3CVerificationDetails | null;
  error: string | null;
};
