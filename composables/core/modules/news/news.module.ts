import NewsService from "./news.service";
import type {
  GenerateNewsDraftPayload,
  NewsArticleType,
  SendNewsChatMessagePayload,
  UpsertNewsArticlePayload,
} from "./news.types";

export class NewsModule {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  async getList(
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      status?: string | null;
      locale?: string | null;
      articleType?: NewsArticleType;
    } = {}
  ) {
    return await this.newsService.list(params);
  }

  async getById(id: string, articleType?: NewsArticleType) {
    return await this.newsService.getById(id, articleType);
  }

  async getMessages(id: string, articleType?: NewsArticleType) {
    return await this.newsService.getMessages(id, articleType);
  }

  async create(payload: UpsertNewsArticlePayload) {
    return await this.newsService.create(payload);
  }

  async update(id: string, payload: UpsertNewsArticlePayload) {
    return await this.newsService.update(id, payload);
  }

  async delete(id: string, articleType?: NewsArticleType) {
    return await this.newsService.delete(id, articleType);
  }

  async forceDelete(id: string, articleType?: NewsArticleType) {
    return await this.newsService.forceDelete(id, articleType);
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
