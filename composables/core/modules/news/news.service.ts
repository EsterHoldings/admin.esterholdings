import useApi from "~/composables/useApi";
import type {
  AdminNewsListResponse,
  AdminNewsStudioResponse,
  GenerateNewsDraftPayload,
  GeneratedNewsDraft,
  SendNewsChatMessagePayload,
  UpsertNewsArticlePayload,
  AdminNewsChatMessage,
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

  async getMessages(id: string): Promise<{ data: { data: AdminNewsChatMessage[] } }> {
    return await this.useApi.get(`/admin/news/${id}/messages`);
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

  async startChat(
    payload: SendNewsChatMessagePayload
  ): Promise<{ data: { data: AdminNewsStudioResponse; message?: string } }> {
    return await this.useApi.post("/admin/news/chat", payload);
  }

  async continueChat(
    id: string,
    payload: SendNewsChatMessagePayload
  ): Promise<{ data: { data: AdminNewsStudioResponse; message?: string } }> {
    return await this.useApi.post(`/admin/news/${id}/chat`, payload);
  }
}

export default NewsService;
