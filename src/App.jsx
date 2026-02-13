import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, Image as ImageIcon, 
  FileText, ArrowLeft, X, TrendingUp, Search, 
  AlertCircle, Target, ShieldAlert, Navigation 
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
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">{stock.ticker.substring(0, 2)}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase">{stock.ticker}</h3>
                      <div className="flex gap-2 mt-1">
                        {stock.entryPrice && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500">E: {stock.entryPrice}</span>}
                        {stock.takeProfit && <span className="text-[10px] bg-green-50 dark:bg-green-900/20 px-1 rounded text-green-600">TP: {stock.takeProfit}</span>}
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
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <input type="text" placeholder="TICKER" className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold text-xl uppercase dark:text-white" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Entry" className="p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={newEntryPrice} onChange={(e) => setNewEntryPrice(e.target.value)} />
              <input type="text" placeholder="SL" className="p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={newStopLoss} onChange={(e) => setNewStopLoss(e.target.value)} />
              <input type="text" placeholder="TP" className="p-2 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white" value={newTakeProfit} onChange={(e) => setNewTakeProfit(e.target.value)} />
            </div>
            <textarea placeholder="Thesis..." rows={4} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl dark:text-white" value={newConviction} onChange={(e) => setNewConviction(e.target.value)} />
          </div>
          <div className="p-4"><button onClick={handleAddStock} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold">Save</button></div>
        </div>
      )}

      {activeView === 'detail' && selectedStock && (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('list')}><ArrowLeft size={24} className="dark:text-white" /></button>
              <h2 className="font-bold dark:text-white uppercase">{selectedStock.ticker}</h2>
            </div>
            <button onClick={() => { setWatchlist(watchlist.filter(s => s.id !== selectedStock.id)); setActiveView('list'); }} className="text-red-500"><Trash2 size={20} /></button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase">Entry</div>
                <div className="font-bold dark:text-white">{selectedStock.entryPrice || '-'}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-center">
                <div className="text-[10px] text-red-400 uppercase">SL</div>
                <div className="font-bold text-red-500">{selectedStock.stopLoss || '-'}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded-lg text-center">
                <div className="text-[10px] text-green-400 uppercase">TP</div>
                <div className="font-bold text-green-500">{selectedStock.takeProfit || '-'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><FileText size={12}/> Notes</div>
              <p className="dark:text-white whitespace-pre-wrap">{selectedStock.conviction || 'No notes'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;