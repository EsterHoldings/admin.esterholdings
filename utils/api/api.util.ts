import axios from "axios";
import * as process from "process";

interface ApiUtilInterface {
  get(path: string, data: any, config: any): any;
  put(path: string, data: any, config: any): any;
  post(path: string, data: any, config: any): any;
  patch(path: string, data: any, config: any): any;
  delete(path: string, config: any): any;
}

export class ApiUtil implements ApiUtilInterface {
  private static _instance: ApiUtilInterface;
  private axios;

  constructor() {
    const axiosConfig = {
      baseURL: "http://139.59.143.82/api/",
      timeout: 30000,
      // headers: {
      //   Authorization:
      //     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMmRmYTE2Yi0yM2U2LTRlODctOGQxYy0yZjkxNDY2ZDcwYTkiLCJlbWFpbCI6ImFzZEBhc2QuYXNkIiwiZmlyc3ROYW1lIjpudWxsLCJpYXQiOjE2ODg2MDIwMDYsImV4cCI6MTY4ODYwMjA2Nn0.ob0yUuaCKZoZi8DxO0QHSQ8wsAUp5G0R-a7wTOdkOxk",
      // },
    };

    this.axios = axios.create(axiosConfig);
  }

  public async get(path: string, config: any = {}): Promise<any> {
    return await this.axios.get(path, config);
  }

  public async put(path: string, data: any, config: any = {}): Promise<any> {
    return await this.axios.put(path, data, config);
  }

  public async post(
    path: string,
    data: any = {},
    config: any = {}
  ): Promise<any> {
    return await this.axios.post(path, data, config);
  }

  public async patch(path: string, data: any, config: any = {}): Promise<any> {
    return await this.axios.patch(path, data, config);
  }

  public async delete(path: string, config: any = {}): Promise<any> {
    return await this.axios.post(path, config);
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }
}

export default ApiUtil;
