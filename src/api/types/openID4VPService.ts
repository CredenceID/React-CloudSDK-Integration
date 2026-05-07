export type OpenID4VPInitiateResponse = {
  sessionId: string;
  //Full OpenID4VP authorization request (DCQL form). Pass to the DC API unchanged.
  payload: Record<string, unknown>;
};

//credential.data returned by the wallet for the openid4vp protocol.
export type OpenID4VPCredentialData = {
  response: string; // JWE compact serialization
};

export type OpenID4VPValidateBody = {
  sessionId: string;
  data: string; // JWE from credential.data.response
};

export type OpenID4VPValidateResponse = {
  res: boolean;
  resDetails: string;  // same stringified-JSON shape as Flow A
  cancelled?: boolean;
};
