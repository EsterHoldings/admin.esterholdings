import useApi from "~/composables/useApi";
import { ROUTE_AUTH_USER } from "~/constants/routes";

export class ClientsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/admin/clients", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/admin/clients/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/admin/clients", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/admin/clients/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/admin/clients/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/admin/clients/${id}`);
  }
}

export default ClientsService;
