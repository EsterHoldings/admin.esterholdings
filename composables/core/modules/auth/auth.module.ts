import { useAuthStore } from "@/stores/authStore";
import { AuthModuleInterface, BasicModuleInterface } from "../module.interface";
import AuthService from "~/composables/core/modules/auth/auth.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class AuthModule implements AuthModuleInterface {
  private authService: AuthService;
  private readonly authStore: any = null;

  constructor() {
    this.authService = new AuthService();
    this.authStore = useAuthStore();
  }

  getStore(): any {
    return this.authStore;
  }

  doLogin(data: any): Promise<any> {
    return this.authService.login(data);
  }

  doLogout(): Promise<any> {
    return undefined;
  }

  doRegistration(data: any): Promise<any> {
    return this.authService.registration(data);
  }
  async getAuthUser() {
    return await this.authService.authUser();
  }

  doSocialLogin(data: any): Promise<any> {
    return this.authService.postSocialLogin(data);
  }

  async doCheckIsAuth(): Promise<any> {
    return await this.authService.checkIsAuth()
  }

  async doRefresh(): Promise<any> {
    return await this.authService.refresh()
  }
}

export default AuthModule;
