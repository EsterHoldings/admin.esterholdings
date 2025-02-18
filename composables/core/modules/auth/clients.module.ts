import { useAuthStore } from "@/stores/authStore";
import { AuthModuleInterface, BasicModuleInterface } from "../module.interface";
import ClientsService from "~/composables/core/modules/auth/clients.service";

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

export class ClientsModule implements BasicModuleInterface {
  private clientsService: ClientsService;

  constructor() {
    this.clientsService = new ClientsService();
  }

  async get(params: object = {}) {
    return await this.clientsService.get(params);
  }

  async getById(id: any): Promise<any> {
    return await this.clientsService.getById(id);
  }

  async post(data: any): Promise<any> {
    console.log("Clients module POST", data);
    return await this.clientsService.post(data);
  }

  async put(id: any, data: object): Promise<any> {
    return await this.clientsService.put(id, data);
  }

  async patch(id: any, data: object): Promise<any> {
    return await this.clientsService.patch(id, data);
  }

  async delete(id: any): Promise<any> {
    return await this.clientsService.delete(id);
  }
}

export default ClientsModule;
