export interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

export interface ReadLaterItem {
  articleId: string;
  addedAt: string;
}
