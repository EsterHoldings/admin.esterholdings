import useApi from "~/composables/useApi";
import {
    ROUTE_ADMIN_AUTH_GET_AVAILABLE_PERMISSIONS, ROUTE_ADMIN_AUTH_GET_USER,
    ROUTE_ADMIN_AUTH_LOGIN,
    ROUTE_ADMIN_AUTH_LOGOUT, ROUTE_ADMIN_AUTH_REFRESH, ROUTE_ADMINS
} from "~/constants/routes";

export class AdminAuthService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi();
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get(ROUTE_ADMINS, params);
  }
  async postLogin(data:object = {}):Promise<any> {
    return await this.useApi.post(ROUTE_ADMIN_AUTH_LOGIN, data);
  }
  async postLogout():Promise<any> {
    return await this.useApi.post(ROUTE_ADMIN_AUTH_LOGOUT);
  }
  async postRefresh():Promise<any> {
    return await this.useApi.post(ROUTE_ADMIN_AUTH_REFRESH);
  }
  async getAvailablePermissions():Promise<any> {
    return await this.useApi.get(ROUTE_ADMIN_AUTH_GET_AVAILABLE_PERMISSIONS);
  }
  async getUser():Promise<any> {
    return await this.useApi.get(ROUTE_ADMIN_AUTH_GET_USER);
  }
}

export default AdminAuthService;
