import React, { useState } from 'react';
import { NewsItem } from '../types';
import { Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {news.imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-xs text-orange-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
            <Calendar size={12} className="mr-1" />
            {new Date(news.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <User size={12} className="mr-1" />
            {news.author}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{news.title}</h3>
        
        <div className="text-gray-600 text-sm mb-4">
          {isExpanded ? (
            <div className="animate-fade-in text-gray-700 leading-relaxed">
              {news.content}
            </div>
          ) : (
            <p className="line-clamp-2">{news.summary}</p>
          )}
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors focus:outline-none"
        >
          {isExpanded ? (
            <>
              ย่อเนื้อหา <ChevronUp size={16} className="ml-1" />
            </>
          ) : (
            <>
              อ่านเพิ่มเติม <ChevronDown size={16} className="ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};