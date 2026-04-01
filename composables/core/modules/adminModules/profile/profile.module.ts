import AdminProfileService from "~/composables/core/modules/adminModules/profile/profile.service";

export class AdminProfileModule {
  private profileService: AdminProfileService;

  constructor() {
    this.profileService = new AdminProfileService();
  }

  async getMe(): Promise<any> {
    return await this.profileService.getMe();
  }

  async updateProfile(data: object = {}): Promise<any> {
    return await this.profileService.updateProfile(data);
  }

  async presignPhoto(params: object = {}): Promise<any> {
    return await this.profileService.presignPhoto(params);
  }

  async uploadPhoto(data: object = {}): Promise<any> {
    return await this.profileService.uploadPhoto(data);
  }

  async selectPhoto(photoHistoryId: string): Promise<any> {
    return await this.profileService.selectPhoto(photoHistoryId);
  }

  async deletePhoto(photoHistoryId: string): Promise<any> {
    return await this.profileService.deletePhoto(photoHistoryId);
  }

  async updatePassword(data: object = {}): Promise<any> {
    return await this.profileService.updatePassword(data);
  }

  async regeneratePassword(): Promise<any> {
    return await this.profileService.regeneratePassword();
  }

  async getActivity(params: object = {}): Promise<any> {
    return await this.profileService.getActivity(params);
  }

  async presencePing(data: object = {}): Promise<any> {
    return await this.profileService.presencePing(data);
  }

  async presenceLeave(data: object = {}): Promise<any> {
    return await this.profileService.presenceLeave(data);
  }
}

export default AdminProfileModule;
