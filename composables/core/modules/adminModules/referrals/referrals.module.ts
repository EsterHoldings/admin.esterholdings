import AdminReferralsService from "~/composables/core/modules/adminModules/referrals/referrals.service";

export class AdminReferralsModule {
  private referralsService: AdminReferralsService;

  constructor() {
    this.referralsService = new AdminReferralsService();
  }

  async getList(params: Record<string, any> = {}): Promise<any> {
    return await this.referralsService.getList(params);
  }

  async getSummary(): Promise<any> {
    return await this.referralsService.getSummary();
  }

  async getMeta(): Promise<any> {
    return await this.referralsService.getMeta();
  }

  async getSettings(): Promise<any> {
    return await this.referralsService.getSettings();
  }

  async updateSettings(data: Record<string, any>): Promise<any> {
    return await this.referralsService.updateSettings(data);
  }
}

export default AdminReferralsModule;
