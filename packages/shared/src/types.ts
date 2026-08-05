export interface Article {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl: string;
  section: string;
}

export interface ReadLaterItem {
  articleId: string;
  addedAt: string;
}

export interface Storage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}