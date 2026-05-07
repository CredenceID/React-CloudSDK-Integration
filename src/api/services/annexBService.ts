import api from "../api";
import type { AnnexBInitiateResponse, AnnexBResultResponse } from "../types/annexBService";

function authHeader(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export async function initiateAnnexBApi(
  accessToken: string
): Promise<AnnexBInitiateResponse> {
  const response = await api.post(
    "/openid4vp/v1/mdoc/initiate",
    {},
    authHeader(accessToken)
  );
  return response.data;
}

// Returns null on 202 (still pending), the result on 200.
// Throws on any other status.
export async function pollAnnexBResultApi(
  accessToken: string,
  sessionId: string
): Promise<AnnexBResultResponse | null> {
  const response = await api.post(
    "/openid4vp/v1/mdoc/result",
    { sessionId },
    {
      ...authHeader(accessToken),
      validateStatus: (status) => status === 200 || status === 202,
    }
  );
  if (response.status === 202) return null;
  return response.data as AnnexBResultResponse;
}

// Same-device resume — no auth token required; response_code is the credential.
export async function resumeAnnexBApi(
  responseCode: string
): Promise<AnnexBResultResponse | null> {
  const response = await api.get(
    `/openid4vp/v1/mdoc/resume?response_code=${encodeURIComponent(responseCode)}`,
    { validateStatus: (status) => status === 200 || status === 202 }
  );
  if (response.status === 202) return null;
  return response.data as AnnexBResultResponse;
}
