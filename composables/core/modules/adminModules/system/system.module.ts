import AdminSystemService from "~/composables/core/modules/adminModules/system/system.service";

export class SystemModule {
  private systemService: AdminSystemService;

  constructor() {
    this.systemService = new AdminSystemService();
  }

  async getBackups(params: object = {}): Promise<any> {
    return await this.systemService.getBackups(params);
  }

  async queueBackup(): Promise<any> {
    return await this.systemService.queueBackup();
  }

  async getMonitoring(params: object = {}): Promise<any> {
    return await this.systemService.getMonitoring(params);
  }
}

export default SystemModule;
