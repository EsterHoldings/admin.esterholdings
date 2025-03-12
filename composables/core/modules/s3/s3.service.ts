import useApi from "~/composables/useApi";

export class S3Service {

  private useApi:any;
  constructor() {
    this.useApi = new useApi();
  }
  async getPreSignedUrl(params: {} = {}):Promise<any> {
    return await this.useApi.get('/admin/get-pre-signed-url', params);
  }
  async getTempViewUrl(params: {} = {}):Promise<any> {
    return await this.useApi.post('/admin/get-temp-view-url', params);
  }
}

export default S3Service;