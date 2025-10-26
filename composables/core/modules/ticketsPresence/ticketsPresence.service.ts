import useApi from "~/composables/useApi";

export class TicketsPresenceService {
    private useApi: any;

    constructor() {
        this.useApi = new useApi(true);
    }

    async post(ticketId: any, params: {}): Promise<any> {
        return await this.useApi.post(`/client/tickets/${ticketId}/presence/ping`, params);
    }

    async delete(ticketId: any, params: {}): Promise<any> {
        return await this.useApi.delete(`/client/tickets/${ticketId}/presence`, params);
    }
}

export default TicketsPresenceService;
