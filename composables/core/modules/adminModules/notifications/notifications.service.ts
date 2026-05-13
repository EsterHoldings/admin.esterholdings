import useApi from "~/composables/useApi";

export class AdminNotificationsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi();
  }

  async get(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/notifications", params);
  }

  async getUnreadSummary(): Promise<any> {
    return await this.useApi.get("/admin/notifications/unread-summary");
  }

  async markAllRead(): Promise<any> {
    return await this.useApi.post("/admin/notifications/read-all");
  }

  async markReadByTypes(types: string[], options: { verificationScope?: "identity" | "payout" } = {}): Promise<any> {
    return await this.useApi.post("/admin/notifications/read-by-types", {
      types,
      verification_scope: options.verificationScope,
    });
  }

  async markRead(notificationId: string): Promise<any> {
    return await this.useApi.post(`/admin/notifications/${notificationId}/read`);
  }
}

export default AdminNotificationsService;
