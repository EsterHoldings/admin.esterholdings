import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {useAdminAuthStore} from "~/stores/adminAuthStore";

export class useApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // baseURL: "http://139.59.143.82/api/",
      baseURL: "http://localhost:8000/api/",
    });

    this.api.interceptors.request.use((config) => {
      const authStore = useAdminAuthStore();
      const token = authStore.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.api.request(config);
  }

  get(url: string, params: object = {}): Promise<AxiosResponse> {
    return this.api.get(url, { params });
  }

  post(url: string, data?: object): Promise<AxiosResponse> {
    return this.api.post(url, data);
  }

  put(url: string, data?: object): Promise<AxiosResponse> {
    return this.api.put(url, data);
  }

  patch(url: string, data?: object): Promise<AxiosResponse> {
    return this.api.patch(url, data);
  }

  delete(url: string, params: object = {}): Promise<AxiosResponse> {
    return this.api.delete(url, { params });
  }
}

export default useApi;