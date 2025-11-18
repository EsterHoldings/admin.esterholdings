import useApi from "~/composables/useApi";

export class AccountsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/accounts", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/client/accounts/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    console.log('ACCOUNTS SERVICE POST', data);
    return await this.useApi.post("/client/accounts", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/accounts/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/account/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/accounts/${id}`);
  }
}

export default AccountsService;
