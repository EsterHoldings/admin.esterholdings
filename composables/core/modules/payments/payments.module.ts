import {BasicModuleInterface} from "../module.interface";
import PaymentsService from "~/composables/core/modules/payments/payments.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class PaymentsModule implements BasicModuleInterface {
  private paymentsService: PaymentsService;

  constructor() {
    this.paymentsService = new PaymentsService();
  }

  async get(params: {} = {}):Promise<any> {
    return await this.paymentsService.get(params);
  }
  async getById(id:any) {
    return await this.paymentsService.get(id);
  }

  async post(data:object = {}):Promise<any> {
    return await this.paymentsService.post(data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.paymentsService.put(id, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.paymentsService.patch(id, data);
  }

  async delete(id:any):Promise<any> {
    return await this.paymentsService.delete(id);
  }


}

export default PaymentsModule;
