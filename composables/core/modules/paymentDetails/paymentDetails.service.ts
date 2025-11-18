import useApi from "~/composables/useApi";

export class PaymentDetailsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/payment-details", params);
  }
  async getById(id:any) {
    return await this.useApi.get(`/client/payment-details/${id}`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/payment-details", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/payment-details/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/payment-details/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/payment-details/${id}`);
  }
}

export default PaymentDetailsService;
