import useApi from "~/composables/useApi";

export class ClientsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async get(params: {}): Promise<any> {
    return await this.useApi.get("/admin/clients", params);
  }
  async getById(id: any) {
    return await this.useApi.get(`/admin/clients/${id}`);
  }

  async getPaymentDetails(id: any, params: object = {}) {
    return await this.useApi.get(`/admin/clients/${id}/payment-details`, params);
  }

  async getPaymentDetailsHistory(id: any, params: object = {}) {
    return await this.useApi.get(`/admin/clients/${id}/payment-details/history`, params);
  }

  async patchPaymentDetailStatus(id: any, paymentDetailId: any, data: object = {}) {
    return await this.useApi.patch(`/admin/clients/${id}/payment-details/${paymentDetailId}`, data);
  }

  async deletePaymentDetail(id: any, paymentDetailId: any): Promise<any> {
    return await this.useApi.delete(`/admin/clients/${id}/payment-details/${paymentDetailId}`);
  }

  async post(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/clients", data);
  }

  async put(id: any, data: object = {}): Promise<any> {
    return await this.useApi.put(`/admin/clients/${id}`, data);
  }

  async patch(id: any, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/clients/${id}`, data);
  }

  async delete(id: any): Promise<any> {
    return await this.useApi.delete(`/admin/clients/${id}`);
  }
}

export default ClientsService;
