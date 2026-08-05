import React, { useEffect, useState } from 'react';
import { fetchArticles, useReadLater } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import { BookmarkIcon } from '../components/BookmarkIcon';

interface Props {
  onArticlePress: (article: Article) => void;
  selectedId?: string;
}

function ArticleCard({
  article,
  saved,
  selected,
  onPress,
  onBookmark,
}: {
  article: Article;
  saved: boolean;
  selected: boolean;
  onPress: () => void;
  onBookmark: (e: React.MouseEvent) => void;
}) {
  return (
    <article
      onClick={onPress}
      className={`relative bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {article.imageUrl && (
        <img src={article.imageUrl} alt="" className="w-full h-44 object-cover" />
      )}
      <div className="p-3 pb-10">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
          {article.section}
        </span>
        <h3 className="text-[17px] font-bold text-gray-900 mt-1 line-clamp-3 leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
      </div>
      <button
        onClick={onBookmark}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
        aria-label={saved ? 'Remove bookmark' : 'Bookmark'}
      >
        <BookmarkIcon
          filled={saved}
          size={20}
          className={saved ? 'text-blue-600' : 'text-gray-400'}
        />
      </button>
    </article>
  );
}

export default function FeedScreen({ onArticlePress, selectedId }: Props) {
  const [articles, setArticles] = useState<Article[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isSaved, toggle } = useReadLater();

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !articles) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500 text-sm">Failed to load articles</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          saved={isSaved(article.id)}
          selected={article.id === selectedId}
          onPress={() => onArticlePress(article)}
          onBookmark={(e) => { e.stopPropagation(); toggle(article.id); }}
        />
      ))}
    </div>
  );
}
