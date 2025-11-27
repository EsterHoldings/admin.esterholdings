import useApi from "~/composables/useApi";

export class DepositService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/deposit", params);
  }

  async post(params: {}):Promise<any> {
    return await this.useApi.post("/client/deposit", params);
  }
}

export default DepositService;
