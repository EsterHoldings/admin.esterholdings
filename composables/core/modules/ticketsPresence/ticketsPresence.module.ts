import TicketsPresenceService from "~/composables/core/modules/ticketsPresence/ticketsPresence.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class TicketsPresenceModule {
  private ticketPresenceService: TicketsPresenceService;

  constructor() {
    this.ticketPresenceService = new TicketsPresenceService();
  }

  async ping(ticketId:any, params: {} = {}):Promise<any> {
    return await this.ticketPresenceService.post(ticketId, params);
  }

  async presence(ticketId:any, params: {} = {}):Promise<any> {
    return await this.ticketPresenceService.delete(ticketId, params);
  }

}

export default TicketsPresenceModule;
