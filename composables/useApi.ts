import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class useApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://139.59.143.82/api/",
    });

    // this.api.interceptors.request.use((config) => {
    //   const token = localStorage.getItem("auth_token");
    //   if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    //   }
    //   return config;
    // });
  }

  request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.api.request(config);
  }

  get(url: string, params: object = {}): Promise<AxiosResponse> {
    return this.api.get(url, {
      params: params,
    });
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
    return this.api.delete(url, {
      params: params,
    });
  }
}

export default useApi;
