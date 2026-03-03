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
}

export default AccountsModule;

