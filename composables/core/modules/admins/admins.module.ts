import {BasicModuleInterface} from "~/composables/core/modules/module.interface";
import AdminsService from "~/composables/core/modules/admins/admins.service";

export class AdminsModule implements BasicModuleInterface {
    private adminsService: AdminsService;

    constructor() {
        this.adminsService = new AdminsService();
    }

    async get(params:object = {}) {
        return await this.adminsService.get(params);
    }

    async getById(id:any): Promise<any> {
        return await this.adminsService.getFirst(id);
    }

    async getActivity(id:any, params: object = {}): Promise<any> {
        return await this.adminsService.getActivity(id, params);
    }

    async post(data:any): Promise<any> {
        return await this.adminsService.post(data);
    }

    async put(id:any, data:object): Promise<any> {
        return await this.adminsService.put(id, data);
    }

    async patch(id:any, data:object): Promise<any> {
        return await this.adminsService.patch(id, data);
    }

    async delete(id:any): Promise<any> {
        return await this.adminsService.delete(id);
    }
}

export default AdminsModule;
