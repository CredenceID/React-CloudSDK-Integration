import axios, { Axios } from "axios";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { CLOUDSDK_BASE_URL } from "@/utils/api/helper";

const axiosInstance = axios.create({ baseURL: CLOUDSDK_BASE_URL });

const api = (axios: Axios) => ({
  get: (url: string, config: AxiosRequestConfig = {}) =>
    axios.get(url, config),

  delete: (url: string, config: AxiosRequestConfig = {}) =>
    axios.delete(url, config),

  post: (url: string, body: object, config: AxiosRequestConfig = {}): Promise<AxiosResponse> =>
    axios.post(url, body, config),

  put: (url: string, body: object, config: AxiosRequestConfig = {}) =>
    axios.put(url, body, config),
});

export default api(axiosInstance);
