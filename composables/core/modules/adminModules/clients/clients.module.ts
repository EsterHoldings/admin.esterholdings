import ClientsService from "~/composables/core/modules/adminModules/clients/clients.service";

export class ClientsModule {
  private clientsService: ClientsService;

  constructor() {
    this.clientsService = new ClientsService();
  }

  async get(params: object = {}) {
    return await this.clientsService.get(params);
  }

  async getStats(params: object = {}): Promise<any> {
    return await this.clientsService.getStats(params);
  }

  async getById(id: any): Promise<any> {
    return await this.clientsService.getById(id);
  }

  async getPaymentDetails(id: any, params: object = {}): Promise<any> {
    return await this.clientsService.getPaymentDetails(id, params);
  }

  async getPaymentDetailsHistory(id: any, params: object = {}): Promise<any> {
    return await this.clientsService.getPaymentDetailsHistory(id, params);
  }

  async patchPaymentDetailStatus(id: any, paymentDetailId: any, data: object = {}): Promise<any> {
    return await this.clientsService.patchPaymentDetailStatus(id, paymentDetailId, data);
  }

  async patchSupportMode(id: any, data: object = {}): Promise<any> {
    return await this.clientsService.patchSupportMode(id, data);
  }

  async updatePassword(id: any, data: object = {}): Promise<any> {
    return await this.clientsService.updatePassword(id, data);
  }

  async disableTwoFactor(id: any): Promise<any> {
    return await this.clientsService.disableTwoFactor(id);
  }

  async deletePaymentDetail(id: any, paymentDetailId: any): Promise<any> {
    return await this.clientsService.deletePaymentDetail(id, paymentDetailId);
  }

  async post(data: any): Promise<any> {
    return await this.clientsService.post(data);
  }

  async put(id: any, data: object): Promise<any> {
    return await this.clientsService.put(id, data);
  }

  async patch(id: any, data: object): Promise<any> {
    return await this.clientsService.patch(id, data);
  }

  async delete(id: any): Promise<any> {
    return await this.clientsService.delete(id);
  }
}

export default ClientsModule;
