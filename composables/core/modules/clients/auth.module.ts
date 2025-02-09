import { useAuthStore } from "@/stores/authStore";
import {AuthModuleInterface, BasicModuleInterface} from "../module.interface";
import AuthService from "~/composables/core/modules/clients/auth.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class AuthModule implements AuthModuleInterface {
  private authService: AuthService;
  private authStore: any = null;

  constructor() {
    this.authService = new AuthService();
    // this.authStore = useAuthStore();
  }

  getStore(): any {
    return this.authStore;
  }

  doLogin(data: any): BasicModuleInterface {
    return undefined;
  }

  doLogout(): BasicModuleInterface {
    return undefined;
  }

  doRegistration(data: any): BasicModuleInterface {
    return undefined;
  }
}

export default AuthModule;
