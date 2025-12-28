
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, RaffleHistory, RaffleSettings } from './types';
import ParticleBackground from './components/ParticleBackground';
import RaffleControlPanel from './components/RaffleControlPanel';
import RaffleDisplay from './components/RaffleDisplay';
import HistoryView from './components/HistoryView';

type Tab = 'input' | 'draw' | 'history';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [participants, setParticipants] = useState<string[]>([]);
  const [history, setHistory] = useState<RaffleHistory[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinners, setCurrentWinners] = useState<string[]>([]);
  const [settings, setSettings] = useState<RaffleSettings>({
    drawCount: 1,
    excludeWinners: true,
  });

  const availableParticipants = useMemo(() => {
    if (!settings.excludeWinners) return participants;
    const allPastWinners = new Set(history.flatMap(h => h.winners));
    return participants.filter(p => !allPastWinners.has(p));
  }, [participants, history, settings.excludeWinners]);

  const handleStartRaffle = useCallback(() => {
    if (availableParticipants.length === 0 || isDrawing) return;
    setIsDrawing(true);
    setCurrentWinners([]);
  }, [availableParticipants.length, isDrawing]);

  const handleFinishRaffle = useCallback((winners: string[]) => {
    const newHistory: RaffleHistory = {
      id: Math.random().toString(36).substr(2, 9),
      round: history.length + 1,
      winners: winners,
      timestamp: Date.now(),
    };
    
    setHistory(prev => [newHistory, ...prev]);
    setCurrentWinners(winners);
    setIsDrawing(false);
  }, [history.length]);

  const handleClearData = useCallback(() => {
    if (window.confirm("確定要清除所有名單與紀錄嗎？")) {
      setParticipants([]);
      setHistory([]);
      setCurrentWinners([]);
      setIsDrawing(false);
    }
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'input', label: '名單輸入', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { id: 'draw', label: '幸運抽獎', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'history', label: '歷史查詢', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black text-white selection:bg-purple-500 selection:text-white">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto w-full">
        <header className="px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-white/10 backdrop-blur-md bg-black/20 gap-4 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl font-black">L</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              LuxeRaffle
            </h1>
          </div>

          <nav className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => !isDrawing && setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                  ${activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}
                  ${isDrawing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {tab.icon}
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'input' && (
              <motion.div
                key="input-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RaffleControlPanel 
                  participants={participants}
                  setParticipants={setParticipants}
                  settings={settings}
                  setSettings={setSettings}
                  onClear={handleClearData}
                  isDrawing={isDrawing}
                  availableCount={availableParticipants.length}
                />
              </motion.div>
            )}

            {activeTab === 'draw' && (
              <motion.div
                key="draw-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="min-h-full flex flex-col items-center justify-start py-8 gap-8"
              >
                <div className="w-full flex-1 flex flex-col items-center justify-center">
                  <RaffleDisplay 
                    isDrawing={isDrawing}
                    participants={availableParticipants}
                    drawCount={Math.min(settings.drawCount, availableParticipants.length > 0 ? availableParticipants.length : settings.drawCount)}
                    onFinish={handleFinishRaffle}
                    currentWinners={currentWinners}
                  />
                </div>
                
                <div className="w-full max-w-md flex flex-col items-center gap-6 mt-auto">
                  {!isDrawing && currentWinners.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartRaffle}
                      disabled={availableParticipants.length === 0}
                      className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all
                        ${availableParticipants.length > 0 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50 cursor-pointer text-white ring-4 ring-purple-500/20' 
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      {availableParticipants.length > 0 ? 'START DRAW' : '名單為空'}
                    </motion.button>
                  )}

                  {currentWinners.length > 0 && !isDrawing && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setCurrentWinners([])}
                        className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-base font-bold transition-all border border-white/10"
                      >
                        準備下一輪
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setActiveTab('history')}
                        className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-base font-bold transition-all shadow-lg shadow-purple-500/20"
                      >
                        查看紀錄
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HistoryView history={history} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
