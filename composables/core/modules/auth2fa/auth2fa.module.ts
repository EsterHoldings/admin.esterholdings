import Auth2faService from "~/composables/core/modules/auth2fa/auth2fa.service";

export class Auth2faModule {
  private auth2faService: Auth2faService;

  constructor() {
    this.auth2faService = new Auth2faService();
  }
  async doVerifyOtp(params: {}): Promise<any> {
    return await this.auth2faService.verifyOtp(params);
  }
  async doGenerate2fa(params: {}): Promise<any> {
    return await this.auth2faService.generate2fa(params);
  }
  async doEnable2fa(params: {}): Promise<any> {
    return await this.auth2faService.enable2fa(params);
  }
  async doDisable2fa(params: {}): Promise<any> {
    return await this.auth2faService.disable2fa(params);
  }
}
export default Auth2faModule;
