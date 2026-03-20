import AdminNotificationsService from "~/composables/core/modules/adminModules/notifications/notifications.service";

export class AdminNotificationsModule {
  private notificationsService: AdminNotificationsService;

  constructor() {
    this.notificationsService = new AdminNotificationsService();
  }

  async get(params: object = {}): Promise<any> {
    return await this.notificationsService.get(params);
  }

  async getUnreadSummary(): Promise<any> {
    return await this.notificationsService.getUnreadSummary();
  }

  async markAllRead(): Promise<any> {
    return await this.notificationsService.markAllRead();
  }

  async markReadByTypes(types: string[]): Promise<any> {
    return await this.notificationsService.markReadByTypes(types);
  }

  async markRead(notificationId: string): Promise<any> {
    return await this.notificationsService.markRead(notificationId);
  }
}

export default AdminNotificationsModule;
