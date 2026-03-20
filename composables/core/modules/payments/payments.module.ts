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
    return await this.paymentsService.getById(id);
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

  async getWithdrawalRequests(params: object = {}): Promise<any> {
    return await this.paymentsService.getWithdrawalRequests(params);
  }

  async getWithdrawalRequestsStats(params: object = {}): Promise<any> {
    return await this.paymentsService.getWithdrawalRequestsStats(params);
  }

  async getWithdrawalRequestsMeta(params: object = {}): Promise<any> {
    return await this.paymentsService.getWithdrawalRequestsMeta(params);
  }

  async getWithdrawalRequestById(id: any): Promise<any> {
    return await this.paymentsService.getWithdrawalRequestById(id);
  }

  async updateWithdrawalRequest(id: any, data: object = {}): Promise<any> {
    return await this.paymentsService.updateWithdrawalRequest(id, data);
  }

  async updateWithdrawalRequestStatus(id: any, data: object = {}): Promise<any> {
    return await this.paymentsService.updateWithdrawalRequestStatus(id, data);
  }


}

export default PaymentsModule;
