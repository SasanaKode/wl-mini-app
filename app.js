import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  Image as ImageIcon, 
  FileText, 
  ArrowLeft,
  X,
  TrendingUp,
  Search,
  AlertCircle,
  Target,
  ShieldAlert,
  Navigation
} from 'lucide-react';

// --- Constants & Defaults ---
const STORAGE_KEY = 'tg_stock_watchlist_v1';

const App = () => {
  // --- State ---
  const [watchlist, setWatchlist] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list', 'detail', 'add'
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states for adding/editing
  const [newTicker, setNewTicker] = useState('');
  const [newConviction, setNewConviction] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [newStopLoss, setNewStopLoss] = useState('');
  const [newTakeProfit, setNewTakeProfit] = useState('');

  // --- Effects ---
  useEffect(() => {
    // Load data from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }

    // Initialize TG WebApp theme if available
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  // --- Handlers ---
  const handleAddStock = () => {
    if (!newTicker.trim()) return;
    
    const newEntry = {
      id: Date.now().toString(),
      ticker: newTicker.toUpperCase(),
      conviction: newConviction,
      image: newImage,
      entryPrice: newEntryPrice,
      stopLoss: newStopLoss,
      takeProfit: newTakeProfit,
      date: new Date().toLocaleDateString(),
      status: 'Watching'
    };

    setWatchlist([newEntry, ...watchlist]);
    // Reset form
    setNewTicker('');
    setNewConviction('');
    setNewImage(null);
    setNewEntryPrice('');
    setNewStopLoss('');
    setNewTakeProfit('');
    setActiveView('list');
  };

  const handleDeleteStock = (id, e) => {
    e.stopPropagation();
    setWatchlist(watchlist.filter(item => item.id !== id));
    if (selectedStock?.id === id) {
      setActiveView('list');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredWatchlist = watchlist.filter(item => 
    item.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Views ---

  // 1. List View
  const ListView = () => (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={24} />
            Watchlist
          </h1>
          <button 
            onClick={() => setActiveView('add')}
            className="p-2 bg-blue-500 text-white rounded-full active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search tickers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center">
            <AlertCircle size={48} className="mb-2" />
            <p>No stocks in watchlist.</p>
            <p className="text-sm">Click the + to add your first conviction.</p>
          </div>
        ) : (
          filteredWatchlist.map((stock) => (
            <div 
              key={stock.id}
              onClick={() => { setSelectedStock(stock); setActiveView('detail'); }}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {stock.ticker.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase truncate">{stock.ticker}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     {stock.entryPrice ? (
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">
                         E: {stock.entryPrice}
                       </span>
                     ) : null}
                     {stock.takeProfit ? (
                       <span className="text-[10px] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded font-medium text-green-600 dark:text-green-400">
                         TP: {stock.takeProfit}
                       </span>
                     ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stock.image && <ImageIcon size={16} className="text-slate-400" />}
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 2. Add/Edit View
  const AddView = () => (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-bottom duration-300">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <button onClick={() => setActiveView('list')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Conviction</h2>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto pb-10">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 uppercase tracking-wider ml-1">Ticker Symbol</label>
          <input 
            type="text"
            placeholder="e.g. BTC"
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none text-slate-900 dark:text-white font-bold text-xl uppercase"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
          />
        </div>

        {/* Trade Parameters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Entry</label>
            <input 
              type="text"
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-lg outline-none text-slate-900 dark:text-white text-sm"
              value={newEntryPrice}
              onChange={(e) => setNewEntryPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">SL</label>
            <input 
              type="text"
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-transparent focus:border-red-500 rounded-lg outline-none text-slate-900 dark:text-white text-sm"
              value={newStopLoss}
              onChange={(e) => setNewStopLoss(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">TP</label>
            <input 
              type="text"
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-transparent focus:border-green-500 rounded-lg outline-none text-slate-900 dark:text-white text-sm"
              value={newTakeProfit}
              onChange={(e) => setNewTakeProfit(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 uppercase tracking-wider ml-1">My Conviction / Thesis</label>
          <textarea 
            placeholder="Why am I buying this?"
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none text-slate-900 dark:text-white resize-none"
            value={newConviction}
            onChange={(e) => setNewConviction(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 uppercase tracking-wider ml-1">Charts / Images</label>
          <div className="relative">
            {newImage ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={newImage} alt="Preview" className="w-full h-48 object-cover" />
                <button 
                  onClick={() => setNewImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Tap to upload chart</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={handleAddStock}
          disabled={!newTicker.trim()}
          className="w-full py-4 bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          Save to Watchlist
        </button>
      </div>
    </div>
  );

  // 3. Detail View
  const DetailView = () => {
    if (!selectedStock) return null;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('list')} className="p-1">
              <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase">{selectedStock.ticker}</h2>
          </div>
          <button 
            onClick={(e) => handleDeleteStock(selectedStock.id, e)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedStock.image && (
            <div className="w-full overflow-hidden">
              <img src={selectedStock.image} alt="Conviction Chart" className="w-full h-auto object-contain bg-slate-100 dark:bg-slate-950" />
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Trade Plan Section */}
            {(selectedStock.entryPrice || selectedStock.stopLoss || selectedStock.takeProfit) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <Target size={14} />
                  Trade Parameters
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Entry</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedStock.entryPrice || '—'}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">
                    <div className="flex items-center gap-1 text-[10px] text-red-500 uppercase font-bold mb-1">
                      <ShieldAlert size={10} />
                      SL
                    </div>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{selectedStock.stopLoss || '—'}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl">
                    <div className="flex items-center gap-1 text-[10px] text-green-500 uppercase font-bold mb-1">
                      <Navigation size={10} className="rotate-45" />
                      TP
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{selectedStock.takeProfit || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <FileText size={14} />
                Conviction & Notes
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-lg">
                {selectedStock.conviction || 'No conviction notes provided.'}
              </p>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-slate-500 text-sm">
                <span>Added to Watchlist</span>
                <span className="font-medium text-slate-900 dark:text-slate-300">{selectedStock.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen overflow-hidden bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {activeView === 'list' && <ListView />}
      {activeView === 'add' && <AddView />}
      {activeView === 'detail' && <DetailView />}
    </div>
  );
};

export default App;