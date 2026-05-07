import api from "../api";
import type {
  OpenID4VPInitiateResponse,
  OpenID4VPValidateBody,
  OpenID4VPValidateResponse,
} from "../types/openID4VPService";

function authHeader(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export async function initiateOpenID4VPApi(
  accessToken: string
): Promise<OpenID4VPInitiateResponse> {
  const response = await api.post(
    "/dcapi/openid4vp/v1/initiate",
    {},
    authHeader(accessToken)
  );
  return response.data;
}

export async function validateOpenID4VPApi(
  accessToken: string,
  body: OpenID4VPValidateBody
): Promise<OpenID4VPValidateResponse> {
  const response = await api.post(
    "/dcapi/openid4vp/v1/validate",
    body,
    authHeader(accessToken)
  );
  return response.data;
}
