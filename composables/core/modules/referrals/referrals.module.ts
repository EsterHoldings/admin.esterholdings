import ReferralsService from "~/composables/core/modules/referrals/referrals.service";

export class ReferralsModule {
  private referralsService: ReferralsService;

  constructor() {
    this.referralsService = new ReferralsService();
  }

  async getList(params: Record<string, any> = {}): Promise<any> {
    return await this.referralsService.getList(params);
  }

  async getLink(): Promise<any> {
    return await this.referralsService.getLink();
  }

  async getSummary(): Promise<any> {
    return await this.referralsService.getSummary();
  }
}

export default ReferralsModule;
