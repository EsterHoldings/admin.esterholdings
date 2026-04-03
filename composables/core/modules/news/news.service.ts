import useApi from "~/composables/useApi";
import type {
  AdminNewsListResponse,
  GenerateNewsDraftPayload,
  GeneratedNewsDraft,
  UpsertNewsArticlePayload,
} from "./news.types";

export class NewsService {
  private useApi: any;

  constructor() {
    this.useApi = new useApi(false);
  }

  async list(
    params: { page?: number; perPage?: number; search?: string; status?: string | null; locale?: string | null } = {}
  ): Promise<{ data: { data: AdminNewsListResponse } }> {
    return await this.useApi.get("/admin/news", params);
  }

  async getById(id: string): Promise<{ data: { data: any } }> {
    return await this.useApi.get(`/admin/news/${id}`);
  }

  async create(payload: UpsertNewsArticlePayload): Promise<{ data: { data: any; message?: string } }> {
    return await this.useApi.post("/admin/news", payload);
  }

  async update(id: string, payload: UpsertNewsArticlePayload): Promise<{ data: { data: any; message?: string } }> {
    return await this.useApi.patch(`/admin/news/${id}`, payload);
  }

  async delete(id: string): Promise<{ data: { message?: string } }> {
    return await this.useApi.delete(`/admin/news/${id}`);
  }

  async generateDraft(
    payload: GenerateNewsDraftPayload
  ): Promise<{ data: { data: GeneratedNewsDraft; message?: string } }> {
    return await this.useApi.post("/admin/news/generate", payload);
  }
}

export default NewsService;
