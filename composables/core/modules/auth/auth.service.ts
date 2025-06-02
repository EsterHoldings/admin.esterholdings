import useApi from "~/composables/useApi";
import {
  ROUTE_ADMIN_AUTH_LOGIN,
  ROUTE_ADMIN_AUTH_LOGOUT,
  ROUTE_ADMINS,
  ROUTE_AUTH_USER,
} from "~/constants/routes";

export class AdminAuthService {
  private useApi: any;
  constructor() {
    this.useApi = new useApi();
  }
  async get(params: {}): Promise<any> {
    return await this.useApi.get(ROUTE_AUTH_USER, params);
  }
  async postLogin(data: object = {}): Promise<any> {
    return await this.useApi.post(ROUTE_ADMIN_AUTH_LOGIN, data);
  }
  async postLogout(): Promise<any> {
    return await this.useApi.post(ROUTE_ADMIN_AUTH_LOGOUT);
  }

  async authUser() {
    return await this.useApi.get(ROUTE_AUTH_USER);
  }

  async postSocialLogin(data: object): Promise<any> {
    return await this.useApi.post("/auth/social", data);
  }
}

export default AdminAuthService;
