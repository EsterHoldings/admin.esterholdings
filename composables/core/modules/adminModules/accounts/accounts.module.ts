import AccountsService from "~/composables/core/modules/adminModules/accounts/accounts.service";

export class AccountsModule {
  private accountsService: AccountsService;

  constructor() {
    this.accountsService = new AccountsService();
  }

  async get(params: object = {}): Promise<any> {
    return await this.accountsService.get(params);
  }

  async getStats(params: object = {}): Promise<any> {
    return await this.accountsService.getStats(params);
  }

  async getMeta(params: object = {}): Promise<any> {
    return await this.accountsService.getMeta(params);
  }

  async getById(id: string): Promise<any> {
    return await this.accountsService.getById(id);
  }

  async post(data: object = {}): Promise<any> {
    return await this.accountsService.post(data);
  }

  async patch(id: string, data: object = {}): Promise<any> {
    return await this.accountsService.patch(id, data);
  }

  async delete(id: string): Promise<any> {
    return await this.accountsService.delete(id);
  }

  async refreshBalance(id: string): Promise<any> {
    return await this.accountsService.refreshBalance(id);
  }
}

export default AccountsModule;
