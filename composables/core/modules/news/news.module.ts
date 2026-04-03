import NewsService from "./news.service";
import type { GenerateNewsDraftPayload, SendNewsChatMessagePayload, UpsertNewsArticlePayload } from "./news.types";

export class NewsModule {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  async getList(
    params: { page?: number; perPage?: number; search?: string; status?: string | null; locale?: string | null } = {}
  ) {
    return await this.newsService.list(params);
  }

  async getById(id: string) {
    return await this.newsService.getById(id);
  }

  async getMessages(id: string) {
    return await this.newsService.getMessages(id);
  }

  async create(payload: UpsertNewsArticlePayload) {
    return await this.newsService.create(payload);
  }

  async update(id: string, payload: UpsertNewsArticlePayload) {
    return await this.newsService.update(id, payload);
  }

  async delete(id: string) {
    return await this.newsService.delete(id);
  }

  async generateDraft(payload: GenerateNewsDraftPayload) {
    return await this.newsService.generateDraft(payload);
  }

  async startChat(payload: SendNewsChatMessagePayload) {
    return await this.newsService.startChat(payload);
  }

  async continueChat(id: string, payload: SendNewsChatMessagePayload) {
    return await this.newsService.continueChat(id, payload);
  }
}

export default NewsModule;
