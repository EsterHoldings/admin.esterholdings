import useApi from "~/composables/useApi";

export class LocationsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(true);
  }

  async countries(params: object = {}): Promise<any> {
    return await this.useApi.get("/client/locations/countries", params);
  }

  async states(params: object = {}): Promise<any> {
    return await this.useApi.get("/client/locations/states", params);
  }

  async cities(params: object = {}): Promise<any> {
    return await this.useApi.get("/client/locations/cities", params);
  }
}

export default LocationsService;
