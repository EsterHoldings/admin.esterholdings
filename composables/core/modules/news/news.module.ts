import NewsService from "./news.service";
import type { GenerateNewsDraftPayload, UpsertNewsArticlePayload } from "./news.types";

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
}

export default NewsModule;
