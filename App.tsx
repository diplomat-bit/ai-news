
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import ChatInterface from './components/ChatInterface';
import { fetchNewsByTopic, getTopicInsights, discoverEmergingTopics } from './services/geminiService';
import { NewsArticle, StaticCategory, FeedPage, LogEntry } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const App: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(Object.values(StaticCategory));
  const [activeCategory, setActiveCategory] = useState<string>(StaticCategory.TOP_STORIES);
  const [pages, setPages] = useState<Record<string, FeedPage>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const initialized = useRef(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  const syncCategory = useCallback(async (cat: string) => {
    setLoading(true);
    addLog(`Initiating autonomous catalog for: ${cat}`, 'ai');
    
    const articles = await fetchNewsByTopic(cat);
    addLog(`Acquired ${articles.length} verified signals for ${cat}`, 'success');
    
    const insights = await getTopicInsights(cat, articles);
    addLog(`Synthesized strategic overview for ${cat}`, 'ai');
    
    const newPage: FeedPage = {
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      title: cat,
      description: `Autonomous analysis for ${cat}`,
      articles,
      lastUpdated: new Date().toISOString(),
      aiInsights: insights
    };

    setPages(prev => ({ ...prev, [cat]: newPage }));
    setLoading(false);
  }, []);

  // Initial Discovery
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const startup = async () => {
      addLog("Nexus Core Booting...", "info");
      addLog("Scanning global information sphere for emerging clusters...", "ai");
      
      const emerging = await discoverEmergingTopics();
      if (emerging.length > 0) {
        setCategories(prev => [...prev, ...emerging]);
        addLog(`Discovered and generated ${emerging.length} new Nexus pages.`, 'success');
      }
      
      syncCategory(StaticCategory.TOP_STORIES);
    };

    startup();
  }, [syncCategory]);

  useEffect(() => {
    if (!pages[activeCategory] && !loading) {
      syncCategory(activeCategory);
    }
  }, [activeCategory, pages, loading, syncCategory]);

  const handleGlobalSync = async () => {
    setSyncing(true);
    await syncCategory(activeCategory);
    setSyncing(false);
  };

  const currentPage = pages[activeCategory];

  const sentimentData = currentPage?.articles.reduce((acc: any[], curr) => {
    const name = curr.sentiment.charAt(0).toUpperCase() + curr.sentiment.slice(1);
    const entry = acc.find(a => a.name === name);
    if (entry) { entry.value++; }
    else { acc.push({ name, value: 1 }); }
    return acc;
  }, []) || [];

  const COLORS: Record<string, string> = {
    Positive: '#10b981',
    Neutral: '#3b82f6',
    Negative: '#f43f5e'
  };

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory}
        categories={categories}
      />

      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                {activeCategory}
              </h2>
              {loading && (
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mono">
                {currentPage ? `Synchronization Cycle Complete [${new Date(currentPage.lastUpdated).toLocaleTimeString()}]` : 'Awaiting signal synchronization...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={handleGlobalSync}
              disabled={syncing || loading}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all uppercase tracking-widest mono disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Signal
            </button>
          </div>
        </header>

        {loading && !currentPage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white/5 rounded-2xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8 space-y-10">
              {currentPage?.aiInsights && (
                <section className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl"></div>
                  <div className="relative border border-white/10 p-8 rounded-2xl bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.69A6.18 6.18 0 0115 10a6.18 6.18 0 01-2.803 5.31v2.653a1 1 0 01-.897.95 1 1 0 01-1.103-.95v-2.653A6.18 6.18 0 018 10a6.18 6.18 0 012.803-5.31V1.997a1 1 0 011.103-.95zM10 8a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mono">Nexus Executive Summary</h3>
                    </div>
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light italic">
                      {currentPage.aiInsights}
                    </p>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentPage?.articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 space-y-10">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-8 sticky top-8">
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mono mb-6">Sentiment Spectrum</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mono mb-6">Information Vectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(currentPage?.articles.flatMap(a => a.tags))).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] mono text-white/50 uppercase tracking-tight hover:border-cyan-500/30 hover:text-cyan-400 transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mono mb-6">System Log Feed</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scroll">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 text-[10px] mono leading-tight">
                        <span className="text-white/20 whitespace-nowrap">[{log.timestamp}]</span>
                        <span className={`
                          ${log.type === 'ai' ? 'text-cyan-400' : ''}
                          ${log.type === 'success' ? 'text-emerald-400' : ''}
                          ${log.type === 'warning' ? 'text-amber-400' : ''}
                          ${log.type === 'info' ? 'text-white/40' : ''}
                        `}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <ChatInterface articles={currentPage?.articles || []} />
    </div>
  );
};

export default App;
