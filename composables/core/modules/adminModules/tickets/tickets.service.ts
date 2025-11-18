import useApi from "~/composables/useApi";

export class TicketsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi();
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/admin/tickets", params);
  }

  async getTicketMessages(ticketId:string, payload:any = {}):Promise<any> {
    return await this.useApi.get(`/admin/tickets/${ticketId}/messages`, payload);
  }

  async storeTicketMessage(ticketId:string, payload:any = {}):Promise<any> {
    return await this.useApi.post(`/admin/tickets/${ticketId}/messages`, payload);
  }

  async getById(id:any) {
    return await this.useApi.get(`/admin/tickets/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/admin/tickets", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/admin/tickets/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/admin/tickets/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/admin/tickets/${id}`);
  }
}

export default TicketsService;
