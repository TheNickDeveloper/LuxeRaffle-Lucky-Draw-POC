
import React from 'react';
import { motion } from 'framer-motion';
import { RaffleHistory } from '../types';

interface Props {
  history: RaffleHistory[];
}

const HistoryView: React.FC<Props> = ({ history }) => {
  const downloadCSV = () => {
    if (history.length === 0) return;

    // Excel usually expects a BOM for UTF-8 and sometimes "sep=," at the start.
    // We will use standard comma separation and BOM.
    const headers = ["Round", "Timestamp", "Winners"];

    const rows = history.map(round => {
      // Escape quotes in content
      const time = new Date(round.timestamp).toLocaleString().replace(/"/g, '""');
      const winners = round.winners.join(";").replace(/"/g, '""');

      return [
        round.round,
        `"${time}"`,
        `"${winners}"`
      ].join(",");
    });

    // Combine with BOM
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `lucky_draw_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full gap-8">
      {/* 標題與描述區塊 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          中獎歷史紀錄
        </h2>
        <p className="text-gray-500 font-medium">
          系統已為您保存所有抽獎輪次與中獎名單，您可以隨時查閱或下載。
        </p>
      </div>

      {/* 下載按鈕區塊 */}
      {history.length > 0 && (
        <div className="flex">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-6 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            下載中獎清單 (.CSV)
          </button>
        </div>
      )}

      {/* 紀錄清單區塊 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-700 bg-white/5 border border-white/5 border-dashed rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-bold opacity-30 tracking-widest uppercase">目前尚無抽獎紀錄</p>
            <p className="text-sm opacity-20 mt-2">開始您的第一場幸運抽獎吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/[0.08] relative overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center bg-purple-600/20 w-24 h-24 rounded-3xl border border-purple-500/20 shrink-0">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">ROUND</span>
                  <span className="text-4xl font-black text-white">{item.round}</span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-gray-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      {item.winners.length} 名幸運兒
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.winners.map((name, i) => (
                      <span key={i} className="text-lg font-black bg-white/5 group-hover:bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 group-hover:border-purple-500/30 transition-all shadow-sm text-white">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 border border-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
