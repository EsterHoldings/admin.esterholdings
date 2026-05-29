import useApi from "~/composables/useApi";

export class AdminSystemService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async getBackups(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/system/backups", params);
  }

  async queueBackup(): Promise<any> {
    return await this.useApi.post("/admin/system/backups");
  }

  async getMonitoring(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/system/monitoring", params);
  }
}

export default AdminSystemService;
