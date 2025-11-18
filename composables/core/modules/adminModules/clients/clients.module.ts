import { useAuthStore } from "@/stores/authStore";
import ClientsService from "~/composables/core/modules/adminModules/clients/clients.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class ClientsModule {
  private clientsService: ClientsService;

  constructor() {
    this.clientsService = new ClientsService();
  }

  async get(params:object = {}) {
    return await this.clientsService.get(params);
  }

  async getById(id:any): Promise<any> {
    return await this.clientsService.getById(id);
  }

  async post(data:any): Promise<any> {
    return await this.clientsService.post(data);
  }

  async put(id:any, data:object): Promise<any> {
    return await this.clientsService.put(id, data);
  }

  async patch(id:any, data:object): Promise<any> {
    return await this.clientsService.patch(id, data);
  }

  async delete(id:any): Promise<any> {
    return await this.clientsService.delete(id);
  }
}

export default ClientsModule;
