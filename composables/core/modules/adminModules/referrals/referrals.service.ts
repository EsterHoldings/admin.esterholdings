import useApi from "~/composables/useApi";

export class AdminReferralsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async getList(params: Record<string, any> = {}): Promise<any> {
    return await this.useApi.get("/admin/referrals", params);
  }

  async getSummary(): Promise<any> {
    return await this.useApi.get("/admin/referrals/summary");
  }

  async getMeta(): Promise<any> {
    return await this.useApi.get("/admin/referrals/meta");
  }

  async getSettings(): Promise<any> {
    return await this.useApi.get("/admin/referrals/settings");
  }

  async updateSettings(data: Record<string, any>): Promise<any> {
    return await this.useApi.put("/admin/referrals/settings", data);
  }
}

export default AdminReferralsService;
