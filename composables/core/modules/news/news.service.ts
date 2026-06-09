import useApi from "~/composables/useApi";
import type {
  AdminNewsListResponse,
  AdminNewsStudioResponse,
  GenerateNewsDraftPayload,
  GeneratedNewsDraft,
  NewsArticleType,
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
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      status?: string | null;
      locale?: string | null;
      articleType?: NewsArticleType;
    } = {}
  ): Promise<{ data: { data: AdminNewsListResponse } }> {
    const { articleType, ...query } = params;
    return await this.useApi.get(this.basePath(articleType), query);
  }

  async getById(id: string, articleType?: NewsArticleType): Promise<{ data: { data: any } }> {
    return await this.useApi.get(`${this.basePath(articleType)}/${id}`);
  }

  async getMessages(id: string, articleType?: NewsArticleType): Promise<{ data: { data: AdminNewsChatMessage[] } }> {
    return await this.useApi.get(`${this.basePath(articleType)}/${id}/messages`);
  }

  async create(payload: UpsertNewsArticlePayload): Promise<{ data: { data: any; message?: string } }> {
    return await this.useApi.post(this.basePath(payload.article_type), payload);
  }

  async update(id: string, payload: UpsertNewsArticlePayload): Promise<{ data: { data: any; message?: string } }> {
    return await this.useApi.patch(`${this.basePath(payload.article_type)}/${id}`, payload);
  }

  async delete(id: string, articleType?: NewsArticleType): Promise<{ data: { message?: string } }> {
    return await this.useApi.delete(`${this.basePath(articleType)}/${id}`);
  }

  async generateDraft(
    payload: GenerateNewsDraftPayload
  ): Promise<{ data: { data: GeneratedNewsDraft; message?: string } }> {
    return await this.useApi.post(`${this.basePath(payload.article_type)}/generate`, payload);
  }

  async startChat(
    payload: SendNewsChatMessagePayload
  ): Promise<{ data: { data: AdminNewsStudioResponse; message?: string } }> {
    return await this.useApi.post(`${this.basePath(payload.article_type)}/chat`, payload);
  }

  async continueChat(
    id: string,
    payload: SendNewsChatMessagePayload
  ): Promise<{ data: { data: AdminNewsStudioResponse; message?: string } }> {
    return await this.useApi.post(`${this.basePath(payload.article_type)}/${id}/chat`, payload);
  }

  private basePath(articleType: NewsArticleType = "news"): string {
    return articleType === "trader_blog" ? "/admin/trader-blog" : "/admin/news";
  }
}

export default NewsService;
