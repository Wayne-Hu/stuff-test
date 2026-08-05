import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReadLaterProvider } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import FeedScreen from './screens/FeedScreen';
import ReadLaterScreen from './screens/ReadLaterScreen';
import ArticleScreen from './screens/ArticleScreen';
import { BookmarkIcon } from './components/BookmarkIcon';

const webStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

type Tab = 'feed' | 'readLater';

function NewspaperIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
    </svg>
  );
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

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-300 select-none">
      <svg
        width={48}
        height={48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-3"
      >
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
      <p className="text-base font-medium">Select an article to read</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab: Tab = location.pathname === '/read-later' ? 'readLater' : 'feed';
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  function switchTab(next: Tab) {
    navigate(next === 'readLater' ? '/read-later' : '/');
    setSelectedArticle(null);
  }

  return (
    <ReadLaterProvider storage={webStorage}>
      <div className="flex flex-col h-full bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
            {/* Left: back button (mobile, when article open) or app title */}
            <div className="flex items-center gap-2">
              {selectedArticle ? (
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="md:hidden flex items-center gap-1 text-blue-600 font-medium text-sm"
                >
                  <BackArrow />
                  Back
                </button>
              ) : null}
              <span
                className={`font-bold text-lg text-gray-900 ${selectedArticle ? 'hidden md:block' : ''}`}
              >
                Read Later
              </span>
            </div>

            {/* Desktop nav tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => switchTab('feed')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'feed'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <NewspaperIcon />
                Feed
              </button>
              <button
                onClick={() => switchTab('readLater')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'readLater'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookmarkIcon filled={false} size={16} />
                Read Later
              </button>
            </nav>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-5xl mx-auto w-full flex flex-col md:flex-row">

            {/* Desktop: left panel (article list) */}
            <div className="hidden md:flex flex-col w-96 flex-shrink-0 border-r border-gray-200 overflow-y-auto">
              {tab === 'feed' ? (
                <FeedScreen
                  onArticlePress={setSelectedArticle}
                  selectedId={selectedArticle?.id}
                />
              ) : (
                <ReadLaterScreen
                  onArticlePress={setSelectedArticle}
                  selectedId={selectedArticle?.id}
                />
              )}
            </div>

            {/* Desktop: right panel (article detail) */}
            <div className="hidden md:block flex-1 overflow-y-auto bg-white">
              {selectedArticle ? (
                <ArticleScreen article={selectedArticle} />
              ) : (
                <EmptyDetail />
              )}
            </div>

            {/* Mobile: single column */}
            <div className="md:hidden flex-1 overflow-y-auto">
              {selectedArticle ? (
                <ArticleScreen article={selectedArticle} />
              ) : tab === 'feed' ? (
                <FeedScreen onArticlePress={setSelectedArticle} />
              ) : (
                <ReadLaterScreen onArticlePress={setSelectedArticle} />
              )}
            </div>
          </div>
        </div>

        {/* Mobile: bottom tab bar */}
        <nav className="md:hidden flex-shrink-0 bg-white border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => switchTab('feed')}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                tab === 'feed' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <NewspaperIcon />
              Feed
            </button>
            <button
              onClick={() => switchTab('readLater')}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                tab === 'readLater' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <BookmarkIcon filled={false} size={18} />
              Read Later
            </button>
          </div>
        </nav>
      </div>
    </ReadLaterProvider>
  );
}
