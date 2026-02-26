import LocationsService from "~/composables/core/modules/locations/locations.service";

export class LocationsModule {
  private locationsService: LocationsService;

  constructor() {
    this.locationsService = new LocationsService();
  }

  async countries(params: object = {}): Promise<any> {
    return await this.locationsService.countries(params);
  }

  async states(params: object = {}): Promise<any> {
    return await this.locationsService.states(params);
  }

  async cities(params: object = {}): Promise<any> {
    return await this.locationsService.cities(params);
  }
}

export default LocationsModule;
