import AuthService from "~/composables/core/modules/auth/auth.service";

export class AuthModule {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  async doRegister(params: {}): Promise<any> {
    return new Promise((res, rej) => res(true));
  }
  async doLogin(params: {}): Promise<any> {
    return await this.authService.postLogin(params);
  }
  async doLogout(params: {}): Promise<any> {
    return await this.authService.postLogout();
  }
  async doForgotPass(params: {}): Promise<any> {
    return new Promise(() => {});
  }

  async doSocialLogin(params: {}): Promise<any> {
    return await this.authService.postSocialLogin(params);
  }
}
export default AuthModule;
