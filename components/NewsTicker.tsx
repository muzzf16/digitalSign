
import React from 'react';
import type { NewsItem } from '../types';

interface NewsTickerProps {
  items: NewsItem[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  const displayItems = [...items, ...items, ...items]; // Triple for smoother long loop

  return (
    <footer className="h-12 bg-black/40 border-t-2 border-slate-700 text-slate-300 flex items-center overflow-hidden flex-shrink-0">
      <div className="ticker-wrap w-full">
        <div className="ticker-move">
          {displayItems.map((item, index) => (
            <span key={index} className="mx-6 text-xl font-medium">
              {item.title} — <span className="font-semibold text-white">{item.source}</span>
              <span className="text-amber-400 mx-6">•</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default NewsTicker;