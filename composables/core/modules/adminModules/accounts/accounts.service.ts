import useApi from "~/composables/useApi";

export class AccountsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async get(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/accounts", params);
  }

  async getStats(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/accounts/stats", params);
  }

  async getMeta(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/accounts/meta", params);
  }

  async getById(id: string): Promise<any> {
    return await this.useApi.get(`/admin/accounts/${id}`);
  }

  async post(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/accounts", data);
  }

  async patch(id: string, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/accounts/${id}`, data);
  }

  async delete(id: string): Promise<any> {
    return await this.useApi.delete(`/admin/accounts/${id}`);
  }

  async refreshBalance(id: string): Promise<any> {
    return await this.useApi.post(`/admin/accounts/${id}/refresh-balance`);
  }
}

export default AccountsService;
