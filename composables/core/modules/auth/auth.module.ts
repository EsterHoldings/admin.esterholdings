import { useAuthStore } from "@/stores/authStore";
import { AuthModuleInterface, BasicModuleInterface } from "../module.interface";
import AuthService from "~/composables/core/modules/auth/auth.service";

import {
  COOKIE_STORAGE__ACCESS_TOKEN,
  COOKIE_STORAGE__REFRESH_TOKEN,
} from "~/constants/storage";
import {
  setItem as setItemToCookie,
  clearItem as clearItemToCookie,
} from "@/utils/storage/cookie";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

// export class AuthModule implements BasicModuleInterface {
export class AuthModule {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  async userRegister(params: {}):Promise<any> {
    // return await this.authService.userRegister("/users/register", params);
    return new Promise((res, rej) => res(true));
  }
  async userLogin(params: {}):Promise<any> {
    // return await this.authService.userLogin("/users/login", params);
    return new Promise((res, rej) => res(true));
  }
  async userLogout(params: {}):Promise<any> {
    // return await this.authService.userLogout("/users/logout", params);
    return new Promise((res, rej) => res(true));
  }
  async userForgotPass(params: {}):Promise<any> {
    // return await this.authService.userForgotPass("/users/forgot_pass", params);
    return new Promise((res, rej) => res(true));
  }

  async adminLogin(params: {}):Promise<any> {
    // return await this.authService.adminLogin(`/admins/login`, params);
    return new Promise((res, rej) => res(true));
  }
  async adminLogout():Promise<any> {
    return await this.authService.adminLogout();
  }
}

export default AuthModule;
