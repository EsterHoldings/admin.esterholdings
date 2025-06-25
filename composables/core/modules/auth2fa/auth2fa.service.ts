import useApi from "~/composables/useApi";

export class Auth2FaService {
  private useApi: any;
  constructor() {
    this.useApi = new useApi(true);
  }
  async generate2fa(params: {}): Promise<any> {
    return await this.useApi.post('/auth/2fa/generate', params);
  }

  async verifyOtp(params: {}): Promise<any> {
    return await this.useApi.post('/auth/2fa/verify', params);
  }

  async enable2fa(params: {}): Promise<any> {
    return await this.useApi.post('/auth/2fa/enable', params);
  }

  async disable2fa(params: {}): Promise<any> {
    return await this.useApi.post('/auth/2fa/disable', params);
  }

}

export default Auth2FaService;
