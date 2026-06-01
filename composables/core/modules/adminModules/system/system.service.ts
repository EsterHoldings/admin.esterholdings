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

  async getFaqs(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/faqs", params);
  }

  async createFaq(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/faqs", data);
  }

  async updateFaq(id: string | number, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/faqs/${id}`, data);
  }

  async deleteFaq(id: string | number): Promise<any> {
    return await this.useApi.delete(`/admin/faqs/${id}`);
  }
}

export default AdminSystemService;
