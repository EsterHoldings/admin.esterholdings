import AdminAuth2faService from "~/composables/core/modules/adminModules/auth2fa/auth2fa.service";

export class AdminAuth2faModule {
  private adminAuth2faService: AdminAuth2faService;

  constructor() {
    this.adminAuth2faService = new AdminAuth2faService();
  }
  async doVerifyOtp(params: {}): Promise<any> {
    return await this.adminAuth2faService.verifyOtp(params);
  }
  async doGenerate2fa(params: {}): Promise<any> {
    return await this.adminAuth2faService.generate2fa(params);
  }
  async doEnable2fa(params: {}): Promise<any> {
    return await this.adminAuth2faService.enable2fa(params);
  }
  async doDisable2fa(params: {}): Promise<any> {
    return await this.adminAuth2faService.disable2fa(params);
  }
}
export default AdminAuth2faModule;
