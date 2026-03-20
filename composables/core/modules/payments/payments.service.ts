import useApi from "~/composables/useApi";

export class PaymentsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi();
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/admin/transactions", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/admin/transactions/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/admin/transactions", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/admin/transactions/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/admin/transactions/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/admin/transactions/${id}`);
  }

  async getWithdrawalRequests(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/withdrawal-requests", params);
  }

  async getWithdrawalRequestsStats(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/withdrawal-requests/stats", params);
  }

  async getWithdrawalRequestsMeta(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/withdrawal-requests/meta", params);
  }

  async getWithdrawalRequestById(id: any): Promise<any> {
    return await this.useApi.get(`/admin/withdrawal-requests/${id}`);
  }

  async updateWithdrawalRequest(id: any, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/withdrawal-requests/${id}`, data);
  }

  async updateWithdrawalRequestStatus(id: any, data: object = {}): Promise<any> {
    return await this.useApi.patch(`/admin/withdrawal-requests/${id}/status`, data);
  }
}

export default PaymentsService;
