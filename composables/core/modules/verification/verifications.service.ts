import useApi from "~/composables/useApi";

export class VerificationsService {

  private useApi:any;
  constructor() {
    this.useApi = new useApi(true);
  }
  async get(params: {}):Promise<any> {
    return await this.useApi.get("/client/verifications", params);
  }
  async removeCommentForAddress() {
    return await this.useApi.get(`/client/verifications/removeCommentForAddress`);
  }
  async removeCommentForDocuments() {
    return await this.useApi.get(`/client/verifications/removeCommentForDocuments`);
  }

  async post(data:object = {}):Promise<any> {
    return await this.useApi.post("/client/verifications", data);
  }

  async put(id:any, data:object = {}):Promise<any> {
    return await this.useApi.put(`/client/verifications/${id}`, data);
  }

  async patch(id:any, data:object = {}):Promise<any> {
    return await this.useApi.patch(`/client/verifications/${id}`, data);
  }

  async delete(id:any):Promise<any> {
    return await this.useApi.delete(`/client/verifications/${id}`);
  }
}

export default VerificationsService;