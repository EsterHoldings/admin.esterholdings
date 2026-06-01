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

  async getFaqs(params: object = {}): Promise<any> {
    return await this.systemService.getFaqs(params);
  }

  async createFaq(data: object = {}): Promise<any> {
    return await this.systemService.createFaq(data);
  }

  async updateFaq(id: string | number, data: object = {}): Promise<any> {
    return await this.systemService.updateFaq(id, data);
  }

  async deleteFaq(id: string | number): Promise<any> {
    return await this.systemService.deleteFaq(id);
  }
}

export default SystemModule;
