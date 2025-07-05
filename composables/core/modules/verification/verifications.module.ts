import {BasicModuleInterface} from "~/composables/core/modules/module.interface";
import DocumentsService from "~/composables/core/modules/documents/documents.service";
import {VerificationsService} from "~/composables/core/modules/verification/verifications.service";

export class VerificationsModule {
    private documentsService: VerificationsService;

    constructor() {
        this.documentsService = new VerificationsService();
    }

    async get(params:object = {}) {
        return await this.documentsService.get(params);
    }

    async removeCommentForAddress(): Promise<any> {
        return await this.documentsService.removeCommentForAddress();
    }

    async removeCommentForDocuments(): Promise<any> {
        return await this.documentsService.removeCommentForDocuments();
    }

    async post(data:any): Promise<any> {
        return await this.documentsService.post(data);
    }

    async put(id:any, data:object): Promise<any> {
        return await this.documentsService.put(id, data);
    }

    async patch(id:any, data:object): Promise<any> {
        return await this.documentsService.patch(id, data);
    }

    async delete(id:any): Promise<any> {
        return await this.documentsService.delete(id);
    }
}

export default VerificationsModule;
