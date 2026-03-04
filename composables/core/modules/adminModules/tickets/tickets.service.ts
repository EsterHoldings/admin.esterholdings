import useApi from "~/composables/useApi";
import type { AxiosRequestConfig } from "axios";

export class TicketsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi();
  }

  async get(params: {}): Promise<any> {
    return await this.useApi.get("/admin/tickets", params);
  }

  async getTicketMessages(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.get(`/admin/tickets/${ticketId}/messages`, payload);
  }

  async presignTicketAttachment(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/messages/presign`, payload);
  }

  async storeTicketMessage(ticketId: string, payload: any = {}, config: AxiosRequestConfig = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/messages`, payload, config);
  }

  async markRead(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/read`, payload);
  }

  async typing(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/typing`, payload);
  }

  async getUnreadSummary(): Promise<any> {
    return await this.useApi.get("/admin/tickets/unread-summary");
  }

  async presencePing(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/presence/ping`, payload);
  }

  async presenceLeave(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.delete(`/admin/tickets/${ticketId}/presence`, payload);
  }

  async getById(id: any) {
    return await this.useApi.get(`/admin/tickets/${id}`);
  }

  async getParticipantAdmins(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.get(`/admin/tickets/${ticketId}/participants/admins`, payload);
  }

  async addParticipantAdmins(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/participants/agents`, payload);
  }

  async post(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/tickets", data);
  }

  async put(id: any, data: object = {}): Promise<any> {
    return await this.useApi.put(`/admin/tickets/${id}`, data);
  }

  async patch(id: any, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/tickets/${id}`, data);
  }

  async delete(id: any): Promise<any> {
    return await this.useApi.delete(`/admin/tickets/${id}`);
  }
}

export default TicketsService;
