import api from "../api";
import type {
  cloudSDKSetupRequestBody,
  CloudSDKSetupResponse,
  CloudSDKRefreshResponse,
} from "../types/cloudSDKService";

export async function cloudSDKSetupApi(
  body: cloudSDKSetupRequestBody
): Promise<CloudSDKSetupResponse> {
  const response = await api.post("/v1/setup", body);
  return response.data;
}

export async function cloudSDKRefreshApi(
  refreshToken: string
): Promise<CloudSDKRefreshResponse> {
  const response = await api.post("/v1/refresh", { refreshToken });
  return response.data;
}
