import {BasicModuleInterface} from "~/composables/core/modules/module.interface";
import DocumentsService from "~/composables/core/modules/adminModules/documents/documents.service";

export class DocumentsModule implements BasicModuleInterface {
    private documentsService: DocumentsService;

    constructor() {
        this.documentsService = new DocumentsService();
    }

    async get(params:object = {}) {
        return await this.documentsService.get(params);
    }

    async getById(id:any): Promise<any> {
        return await this.documentsService.getById(id);
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

export default DocumentsModule;
