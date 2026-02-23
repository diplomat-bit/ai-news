
import React from 'react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const sentimentStyles = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
    neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15_rgba(244,63,94,0.05)]',
  };

  return (
    <div className="group relative bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className="text-[9px] mono uppercase tracking-[0.2em] text-white/30 mb-1">Origin Cluster</span>
          <span className="text-xs font-bold text-white/60">{article.source}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-widest mono ${sentimentStyles[article.sentiment]}`}>
          {article.sentiment}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white/90 mb-4 group-hover:text-cyan-400 transition-colors leading-tight">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
          {article.title}
        </a>
      </h3>
      
      <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3 group-hover:text-white/70 transition-colors">
        {article.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[9px] px-2 py-1 bg-white/5 text-white/40 rounded border border-white/5 mono uppercase tracking-tighter group-hover:border-white/10 transition-colors">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 text-[9px] text-white/20 font-bold uppercase tracking-widest mono">
        <span>Cycle: {new Date(article.publishedAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <span>Priority</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-1 h-2 rounded-full ${i < article.urgency / 2 ? 'bg-cyan-500/60' : 'bg-white/5'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
