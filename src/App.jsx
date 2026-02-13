import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, 
  FileText, ArrowLeft, TrendingUp, Search, 
  AlertCircle, Image as ImageIcon, X
} from 'lucide-react';

const STORAGE_KEY = 'tg_stock_watchlist_v1';

const App = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTicker, setNewTicker] = useState('');
  const [newConviction, setNewConviction] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [newStopLoss, setNewStopLoss] = useState('');
  const [newTakeProfit, setNewTakeProfit] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWatchlist(JSON.parse(saved));
    } catch (e) {
      console.error("Storage error", e);
    }

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

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
      date: new Date().toLocaleDateString()
    };
    setWatchlist([newEntry, ...watchlist]);
    setNewTicker(''); setNewConviction(''); setNewImage(null);
    setNewEntryPrice(''); setNewStopLoss(''); setNewTakeProfit('');
    setActiveView('list');
  };

  const filteredWatchlist = watchlist.filter(item => 
    item.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto h-screen overflow-hidden bg-white dark:bg-slate-950 font-sans">
      {activeView === 'list' && (
        <div className="flex flex-col h-full">
          <div className="p-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={24} /> Watchlist
              </h1>
              <button onClick={() => setActiveView('add')} className="p-2 bg-blue-500 text-white rounded-full"><Plus size={20} /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search tickers..." className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredWatchlist.length === 0 ? (
              <div className="text-center py-10 opacity-50"><AlertCircle size={48} className="mx-auto mb-2" /><p>Empty Watchlist</p></div>
            ) : (
              filteredWatchlist.map((stock) => (
                <div key={stock.id} onClick={() => { setSelectedStock(stock); setActiveView('detail'); }} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {stock.ticker.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase truncate">{stock.ticker}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {stock.entryPrice && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500">E: {stock.entryPrice}</span>}
                        {stock.takeProfit && <span className="text-[10px] bg-green-50 dark:bg-green-900/20 px-1 rounded text-green-600">TP: {stock.takeProfit}</span>}
                        {stock.image && <ImageIcon size={12} className="text-blue-400" />}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeView === 'add' && (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button onClick={() => setActiveView('list')}><ArrowLeft size={24} className="dark:text-white" /></button>
            <h2 className="text-lg font-bold dark:text-white">New Conviction</h2>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto pb-10">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Symbol</label>
              <input type="text" placeholder="TICKER" className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold text-xl uppercase dark:text-white border-2 border-transparent focus:border-blue-500 outline-none" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Entry</label>
                <input type="text" placeholder="0.00" className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white outline-none focus:ring-1 focus:ring-blue-500" value={newEntryPrice} onChange={(e) => setNewEntryPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">SL</label>
                <input type="text" placeholder="0.00" className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white outline-none focus:ring-1 focus:ring-red-500" value={newStopLoss} onChange={(e) => setNewStopLoss(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">TP</label>
                <input type="text" placeholder="0.00" className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white outline-none focus:ring-1 focus:ring-green-500" value={newTakeProfit} onChange={(e) => setNewTakeProfit(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Conviction Notes</label>
              <textarea placeholder="Why are you bullish/bearish?" rows={4} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl dark:text-white outline-none focus:border-blue-500 border-2 border-transparent resize-none" value={newConviction} onChange={(e) => setNewConviction(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Chart / Screenshot</label>
              {newImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={newImage} alt="Preview" className="w-full h-48 object-cover" />
                  <button onClick={() => setNewImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={16}/></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800">
                  <ImageIcon size={24} className="text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">Add Chart</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
            <button onClick={handleAddStock} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">Save to Watchlist</button>
          </div>
        </div>
      )}

      {activeView === 'detail' && selectedStock && (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('list')}><ArrowLeft size={24} className="dark:text-white" /></button>
              <h2 className="font-bold dark:text-white uppercase">{selectedStock.ticker}</h2>
            </div>
            <button onClick={() => { setWatchlist(watchlist.filter(s => s.id !== selectedStock.id)); setActiveView('list'); }} className="text-red-500 p-2"><Trash2 size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedStock.image && (
              <img src={selectedStock.image} alt="Chart" className="w-full h-auto max-h-80 object-contain bg-slate-50 dark:bg-slate-950" />
            )}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Entry</div>
                  <div className="font-bold dark:text-white">{selectedStock.entryPrice || '-'}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-red-400 uppercase font-bold">SL</div>
                  <div className="font-bold text-red-500">{selectedStock.stopLoss || '-'}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-green-400 uppercase font-bold">TP</div>
                  <div className="font-bold text-green-500">{selectedStock.takeProfit || '-'}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><FileText size={12}/> Conviction Notes</div>
                <p className="dark:text-white whitespace-pre-wrap text-lg leading-relaxed">{selectedStock.conviction || 'No notes'}</p>
              </div>
              <div className="pt-4 border-t dark:border-slate-800 text-[10px] text-slate-400 text-right uppercase">Added on {selectedStock.date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;