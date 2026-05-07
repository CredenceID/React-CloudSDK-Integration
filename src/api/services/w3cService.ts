import api from "../api";
import type { W3CInitiateResponse, W3CResultResponse } from "../types/w3cService";

function authHeader(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export async function initiateW3CApi(
  accessToken: string
): Promise<W3CInitiateResponse> {
  const response = await api.post(
    "/w3c/openid4vp/v1/initiate",
    {},
    authHeader(accessToken)
  );
  return response.data;
}

//Returns null on 202 (still pending), the result on 200.
export async function pollW3CResultApi(
  accessToken: string,
  sessionId: string
): Promise<W3CResultResponse | null> {
  const response = await api.post(
    "/w3c/openid4vp/v1/validate",
    { sessionId },
    {
      ...authHeader(accessToken),
      validateStatus: (status) => status === 200 || status === 202,
    }
  );
  if (response.status === 202) return null;
  return response.data as W3CResultResponse;
}
