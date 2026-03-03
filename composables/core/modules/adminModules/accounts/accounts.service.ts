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
}

export default AccountsService;

