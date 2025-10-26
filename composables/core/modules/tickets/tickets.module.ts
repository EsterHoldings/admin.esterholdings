import {BasicModuleInterface} from "../module.interface";
import TicketsService from "~/composables/core/modules/tickets/tickets.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class TicketsModule implements BasicModuleInterface {
  private ticketsService: TicketsService;

  constructor() {
    this.ticketsService = new TicketsService();
  }

  async get(params: {} = {}):Promise<any> {
    return await this.ticketsService.get(params);
  }

  async getTicketMessages(id:string, payload:any = {}):Promise<any> {
    return await this.ticketsService.getTicketMessages(id, payload);
  }

  async storeTicketMessage(id:string, payload:any = {}):Promise<any> {
    return await this.ticketsService.storeTicketMessage(id, payload);
  }
  async getById(id:any) {
    return await this.ticketsService.getById(id);
  }

  async post(data:object = {}):Promise<any> {
    return await this.ticketsService.post(data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.ticketsService.put(id, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.ticketsService.patch(id, data);
  }

  async delete(id:any):Promise<any> {
    return await this.ticketsService.delete(id);
  }


}

export default TicketsModule;
