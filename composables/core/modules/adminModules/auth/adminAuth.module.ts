import { useAdminAuthStore } from "~/stores/adminAuthStore";
import AdminAuthService from "~/composables/core/modules/adminModules/auth/adminAuth.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class AuthModule {
  private adminAuthService: AdminAuthService;

  constructor() {
    this.adminAuthService = new AdminAuthService();
  }

  private get adminAuthStore() {
    return useAdminAuthStore();
  }

  async doLogin(params: {}): Promise<any> {
    const response = await this.adminAuthService.postLogin(params);

    console.log("ADMIN AUTH DO LOGIN RESPONSE: ", response.data);

    if (response?.data?.accessToken) {
      this.adminAuthStore.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async doLogout(): Promise<any> {
    return await this.adminAuthService.postLogout();
  }

  async doRefresh(): Promise<any> {
    return await this.adminAuthService.postRefresh();
  }

  async getAvailablePermissions(): Promise<any> {
    return await this.adminAuthService.getAvailablePermissions();
  }
}

export default AuthModule;
