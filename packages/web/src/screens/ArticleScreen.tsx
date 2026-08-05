import React from 'react';
import { useReadLater } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import { BookmarkIcon } from '../components/BookmarkIcon';

interface Props {
  article: Article;
  onBack: () => void;
}

function BackArrow() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export default function ArticleScreen({ article, onBack }: Props) {
  const { isSaved, toggle } = useReadLater();
  const saved = isSaved(article.id);

  return (
    <div className="pb-10">
      {/* Desktop: bookmark button in top-right corner of panel */}
      <div className="hidden md:flex justify-end px-6 pt-5">
        <button
          onClick={() => toggle(article.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
            saved
              ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BookmarkIcon filled={saved} size={15} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Mobile: back + bookmark row */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 font-medium text-sm"
        >
          <BackArrow />
          Back
        </button>
        <button
          onClick={() => toggle(article.id)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={saved ? 'Remove bookmark' : 'Save'}
        >
          <BookmarkIcon
            filled={saved}
            size={22}
            className={saved ? 'text-blue-600' : 'text-gray-500'}
          />
        </button>
      </div>

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          className="w-full h-60 object-cover mt-0 md:mt-3"
        />
      )}

      <div className="px-4 md:px-8 pt-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
          {article.section}
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-2 leading-tight">
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {new Date(article.publishedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-base text-gray-700 mt-5 leading-relaxed">
          {article.summary}
        </p>
      </div>
    </div>
  );
}
