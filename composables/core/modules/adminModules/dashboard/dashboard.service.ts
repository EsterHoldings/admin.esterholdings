import useApi from "~/composables/useApi";

export class AdminDashboardService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async getSummary(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/dashboard", params);
  }
}

export default AdminDashboardService;
