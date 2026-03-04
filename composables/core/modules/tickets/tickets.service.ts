import useApi from "~/composables/useApi";
import type { AxiosRequestConfig } from "axios";

export class TicketsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}): Promise<any> {
    return await this.useApi.get("/client/tickets", params);
  }

  async getTicketMessages(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.get(`/client/tickets/${ticketId}/messages`, payload);
  }

  async storeTicketMessage(ticketId: string, payload: any = {}, config: AxiosRequestConfig = {}): Promise<any> {
    return await this.useApi.post(`/client/tickets/${ticketId}/messages`, payload, config);
  }

  async markRead(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/client/tickets/${ticketId}/read`, payload);
  }

  async typing(ticketId: string, payload: any = {}): Promise<any> {
    return await this.useApi.post(`/client/tickets/${ticketId}/typing`, payload);
  }

  async getUnreadSummary(): Promise<any> {
    return await this.useApi.get("/client/tickets/unread-summary");
  }

  async getById(id: any) {
    return await this.useApi.get(`/client/tickets/${id}`);
  }

  async post(data: object = {}): Promise<any> {
    return await this.useApi.post("/client/tickets", data);
  }

  async put(id: any, data: object = {}): Promise<any> {
    return await this.useApi.put(`/client/tickets/${id}`, data);
  }

  async patch(id: any, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/client/tickets/${id}`, data);
  }

  async delete(id: any): Promise<any> {
    return await this.useApi.delete(`/client/tickets/${id}`);
  }
}

export default TicketsService;
