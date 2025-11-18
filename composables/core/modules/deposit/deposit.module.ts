import DepositService from "~/composables/core/modules/deposit/deposit.service";

export class DepositModule {
    private depositService: DepositService;

    constructor() {
        this.depositService = new DepositService();
    }

    async get(params: {} = {}): Promise<any> {
        return await this.depositService.get(params);
    }
}

export default DepositModule;
