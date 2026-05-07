import api from "../api";
import type {
  GetDocRequestResponse,
  VerifyDocRequestBody,
  VerifyDocRequestResponse,
} from "../types/iso18013Service";

function authHeader(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export async function getDocRequestApi(
  accessToken: string
): Promise<GetDocRequestResponse> {
  const response = await api.post("/v1/getDocRequest", {}, authHeader(accessToken));
  return response.data;
}

export async function verifyDocRequestApi(
  accessToken: string,
  body: VerifyDocRequestBody
): Promise<VerifyDocRequestResponse> {
  const response = await api.post("/v1/verifyDocRequest", body, authHeader(accessToken));
  return response.data;
}
