import AdminDashboardService from "~/composables/core/modules/adminModules/dashboard/dashboard.service";

export class DashboardModule {
  private dashboardService: AdminDashboardService;

  constructor() {
    this.dashboardService = new AdminDashboardService();
  }

  async getSummary(params: object = {}): Promise<any> {
    return await this.dashboardService.getSummary(params);
  }
}

export default DashboardModule;
