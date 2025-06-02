import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useAuthStore } from "~/stores/authStore";

export class useApi {
  private api: AxiosInstance;

  constructor(forClient = false) {
    this.api = axios.create({
      baseURL: "http://127.0.0.1:8000/api/",
      // baseURL: "https://esterholdings.website/api/",
    });

    this.api.interceptors.request.use((config) => {
      const authStore = forClient ? useAuthStore() : useAdminAuthStore();
      let token = authStore.accessToken;

      // TODO :: Переделать все на стор
      if (forClient) token = localStorage.getItem("user_access_token");

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
