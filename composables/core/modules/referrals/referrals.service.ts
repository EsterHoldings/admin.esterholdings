import useApi from "~/composables/useApi";

export class ReferralsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async getList(params: Record<string, any> = {}): Promise<any> {
    return await this.useApi.get("/client/referrals", params);
  }

  async getLink(): Promise<any> {
    return await this.useApi.get("/client/referrals/link");
  }

  async getSummary(): Promise<any> {
    return await this.useApi.get("/client/referrals/summary");
  }
}

export default ReferralsService;
