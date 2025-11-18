import {BasicModuleInterface} from "../module.interface";
import AccountsService from "~/composables/core/modules/accounts/accounts.service";

interface ResponseDTO {
  success: Boolean;
  data: any;
  errors: any;
}

export class AccountsModule implements BasicModuleInterface {
  private accountsService: AccountsService;

  constructor() {
    this.accountsService = new AccountsService();
  }

  async get(params: {} = {}):Promise<any> {
    return await this.accountsService.get(params);
  }
  async getById(id:any) {
    return await this.accountsService.getById(id);
  }

  async post(data:object = {}):Promise<any> {
    return await this.accountsService.post(data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.accountsService.put(id, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.accountsService.patch(id, data);
  }

  async delete(id:any):Promise<any> {
    return await this.accountsService.delete(id);
  }


}

export default AccountsModule;
