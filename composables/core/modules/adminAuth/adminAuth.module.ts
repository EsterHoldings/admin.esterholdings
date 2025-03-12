import { useAdminAuthStore } from "@/stores/adminAuthStore";
import AdminAuthService from "~/composables/core/modules/adminAuth/adminAuth.service";

interface ResponseDTO {
    success: Boolean;
    data: any;
    errors: any;
}

export class AuthModule {
    private adminAuthService: AdminAuthService;
    private adminAuthStore: any;

    constructor() {
        this.adminAuthService = new AdminAuthService();
        this.adminAuthStore = useAdminAuthStore();
    }

    async doLogin(params: {}):Promise<any> {
        const response = await this.adminAuthService.postLogin(params);
        console.log('Response: ', response);
        console.log('Response data: ', response.data);
        // If status - 200
        // 1. Save accessToken and refreshToken

        return response;
    }

    async doLogout():Promise<any> {
        return await this.adminAuthService.postLogout();
    }

    async getAvailablePermissions():Promise<any> {
        return await this.adminAuthService.getAvailablePermissions();
    }
}

export default AuthModule;
