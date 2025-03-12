import S3Service from "~/composables/core/modules/s3/s3.service";

interface ResponseDTO {
    success: Boolean;
    data: any;
    errors: any;
}

export class S3Module {
    private S3Service: S3Service;

    constructor() {
        this.S3Service = new S3Service();
    }

    async getPreSignedUrl(data:object = {}):Promise<any> {
        return await this.S3Service.getPreSignedUrl(data);
    }

    async getTempViewUrl(data:object = {}):Promise<any> {
        return await this.S3Service.getTempViewUrl(data);
    }
}

export default S3Module;
