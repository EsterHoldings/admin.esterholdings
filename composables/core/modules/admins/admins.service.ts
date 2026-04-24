import useApi from "~/composables/useApi";

export class AdminsService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi();
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get("/admins", params);
  }
  async getFirst(id:any):Promise<any> {
    return await this.useApi.get(`/admins/${id}`);
  }

  async getActivity(id:any, params: {} = {}):Promise<any> {
    return await this.useApi.get(`/admins/${id}/activity`, params);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/admins", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/admins/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/admins/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/admins/${id}/delete`);
  }
}

export default AdminsService;
