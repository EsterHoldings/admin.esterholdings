export type NewsStatus = "draft" | "scheduled" | "published";
export type NewsTone = "professional" | "neutral" | "promotional" | "analytical";

export interface NewsSeoPayload {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[];
  canonical_url?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  schema_type?: string | null;
}

export interface AdminNewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  locale: string;
  cover_image_url: string | null;
  gallery_images: string[];
  video_links: string[];
  status: NewsStatus;
  effective_status: NewsStatus;
  published_at: string | null;
  seo: NewsSeoPayload;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AdminNewsChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta: Record<string, any>;
  created_at: string;
}

export interface AdminNewsListResponse {
  data: AdminNewsArticle[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

export interface GenerateNewsDraftPayload {
  topic: string;
  locale: string;
  tone: NewsTone;
  angle?: string | null;
  additional_instructions?: string | null;
  generate_images?: boolean;
  image_count?: number;
  include_video_links?: boolean;
}

export interface GeneratedNewsDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string;
  cover_image_url: string | null;
  gallery_images: string[];
  video_links: string[];
  warnings: string[];
  meta: Record<string, any>;
}

export interface UpsertNewsArticlePayload {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content: string;
  locale: string;
  cover_image_url?: string | null;
  gallery_images?: string[];
  video_links?: string[];
  status: NewsStatus;
  published_at?: string | null;
  seo?: NewsSeoPayload;
  meta?: Record<string, any>;
}

export interface SendNewsChatMessagePayload {
  message: string;
  locale?: string;
  generate_images?: boolean;
  include_video_links?: boolean;
  article_snapshot?: Partial<AdminNewsArticle> | null;
  seo_snapshot?: NewsSeoPayload | null;
}

export interface AdminNewsStudioResponse {
  article: AdminNewsArticle;
  messages: AdminNewsChatMessage[];
}
