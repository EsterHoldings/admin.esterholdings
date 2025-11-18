import {BasicModuleInterface} from "../module.interface";
import PaymentDetailsService from "~/composables/core/modules/paymentDetails/paymentDetails.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class PaymentDetailsModule implements BasicModuleInterface {
  private paymentDetailsService: PaymentDetailsService;

  constructor() {
    this.paymentDetailsService = new PaymentDetailsService();
  }

  async get(params: {} = {}):Promise<any> {
    return await this.paymentDetailsService.get(params);
  }
  async getById(id:any) {
    return await this.paymentDetailsService.get(id);
  }

  async post(data:object = {}):Promise<any> {
    return await this.paymentDetailsService.post(data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.paymentDetailsService.put(id, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.paymentDetailsService.patch(id, data);
  }

  async delete(id:any):Promise<any> {
    return await this.paymentDetailsService.delete(id);
  }


}

export default PaymentDetailsModule;
