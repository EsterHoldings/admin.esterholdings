import useApi from "~/composables/useApi";

export class PaymentsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/payments", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/client/payments/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/payments", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/payments/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/payments/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/payments/${id}`);
  }
}

export default PaymentsService;
