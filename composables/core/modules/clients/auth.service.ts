import useApi from "~/composables/useApi";
import { ROUTE_AUTH_USER } from "~/constants/routes";

export class AuthService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async login(formData: Object): Promise<any> {
    return await this.useApi.post("/auth/login", formData);
  }

  async registration(formData: Object): Promise<any> {
    return await this.useApi.post("/auth/register", formData);
  }

  async logout(formData: Object): Promise<any> {
    return await this.useApi.post("/auth/logout");
  }

  async authUser() {
    return await this.useApi.get(ROUTE_AUTH_USER);
  }

  async postSocialLogin(data: Object): Promise<any> {
    return await this.useApi.post("/auth/social", data);
  }

  async checkIsAuth(): Promise<any> {
    return await this.useApi.get("/auth/isAuth");
  }

  async refresh(): Promise<any> {
    return await this.useApi.post("/auth/refresh");
  }
}

export default AuthService;
