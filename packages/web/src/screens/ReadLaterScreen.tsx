import React, { useEffect, useState } from 'react';
import { fetchArticles, useReadLater } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import { BookmarkIcon } from '../components/BookmarkIcon';

interface Props {
  onArticlePress: (article: Article) => void;
  selectedId?: string;
}

function SavedArticleCard({
  article,
  selected,
  onPress,
  onRemove,
}: {
  article: Article;
  selected: boolean;
  onPress: () => void;
  onRemove: (e: React.MouseEvent) => void;
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
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
        aria-label="Remove bookmark"
      >
        <BookmarkIcon filled size={20} className="text-blue-600" />
      </button>
    </article>
  );
}

export default function ReadLaterScreen({ onArticlePress, selectedId }: Props) {
  const [articles, setArticles] = useState<Article[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { savedIds, toggle } = useReadLater();

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .finally(() => setIsLoading(false));
  }, []);

  const savedArticles = articles?.filter((a) => savedIds.has(a.id)) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (savedArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <BookmarkIcon filled={false} size={48} className="text-gray-300" />
        <p className="text-lg font-bold text-gray-700 mt-4">Nothing saved yet</p>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Tap the bookmark icon on any article to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {savedArticles.map((article) => (
        <SavedArticleCard
          key={article.id}
          article={article}
          selected={article.id === selectedId}
          onPress={() => onArticlePress(article)}
          onRemove={(e) => {
            e.stopPropagation();
            toggle(article.id);
          }}
        />
      ))}
    </div>
  );
}
