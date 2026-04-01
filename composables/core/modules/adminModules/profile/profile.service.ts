import useApi from "~/composables/useApi";

export class AdminProfileService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async getMe(): Promise<any> {
    return await this.useApi.get("/admin/profile");
  }

  async updateProfile(data: object = {}): Promise<any> {
    return await this.useApi.patch("/admin/profile", data);
  }

  async presignPhoto(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/profile/photo/presign", params);
  }

  async uploadPhoto(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/profile/photo", data);
  }

  async selectPhoto(photoHistoryId: string): Promise<any> {
    return await this.useApi.post(`/admin/profile/photos/${photoHistoryId}/select`);
  }

  async deletePhoto(photoHistoryId: string): Promise<any> {
    return await this.useApi.delete(`/admin/profile/photos/${photoHistoryId}`);
  }

  async updatePassword(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/profile/password/update", data);
  }

  async regeneratePassword(): Promise<any> {
    return await this.useApi.post("/admin/profile/password/regenerate");
  }

  async getActivity(params: object = {}): Promise<any> {
    return await this.useApi.get("/admin/profile/activity", params);
  }

  async presencePing(data: object = {}): Promise<any> {
    return await this.useApi.post("/admin/profile/presence/ping", data);
  }

  async presenceLeave(data: object = {}): Promise<any> {
    return await this.useApi.delete("/admin/profile/presence", data);
  }
}

export default AdminProfileService;
