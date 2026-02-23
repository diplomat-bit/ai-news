
import React from 'react';

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, categories }) => {
  return (
    <aside className="w-64 border-r border-white/5 flex flex-col h-screen fixed top-0 left-0 bg-[#050505] z-10 overflow-y-auto">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          NEWS NEXUS
        </h1>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest mono font-medium">Autonomous Intelligence</p>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-1">
        <div className="px-4 mb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mono">Primary Feeds</div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
              activeCategory === cat 
                ? 'bg-cyan-500/10 text-cyan-400 font-medium' 
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{cat}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${activeCategory === cat ? 'bg-cyan-400' : 'bg-transparent group-hover:bg-white/20'} transition-all`}></div>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mono mb-2">System Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-white/50">Core:</span>
              <span className="text-emerald-400 mono">ACTIVE</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/50">Acquisition:</span>
              <span className="text-emerald-400 mono">NOMINAL</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/50">Curation:</span>
              <span className="text-cyan-400 mono">AI-GATED</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
