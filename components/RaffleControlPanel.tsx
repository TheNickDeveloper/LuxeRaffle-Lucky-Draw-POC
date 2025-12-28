
import React, { useState, useRef, useEffect } from 'react';
import { RaffleSettings } from '../types';

interface Props {
  participants: string[];
  setParticipants: React.Dispatch<React.SetStateAction<string[]>>;
  settings: RaffleSettings;
  setSettings: React.Dispatch<React.SetStateAction<RaffleSettings>>;
  onClear: () => void;
  isDrawing: boolean;
  availableCount: number;
}

const RaffleControlPanel: React.FC<Props> = ({ 
  participants, 
  setParticipants, 
  settings, 
  setSettings, 
  onClear,
  isDrawing,
  availableCount
}) => {
  const [inputValue, setInputValue] = useState(participants.join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (participants.length === 0 && inputValue !== "") {
      setInputValue("");
    } else if (participants.length > 0 && (inputValue === "" || participants.length !== inputValue.split(/[;\n]+/).filter(x => x.trim()).length)) {
        setInputValue(participants.join('\n'));
    }
  }, [participants]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const list = val
      .split(/[;\n]+/)
      .map(name => name.trim())
      .filter(name => name !== '');
    
    setParticipants(list);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split(/[\r\n;]+/).filter(line => line.trim() !== '');
      const names = lines.map(line => {
        const parts = line.split(',');
        return parts[0].trim();
      }).filter(name => name !== '' && name.toLowerCase() !== 'name');
      
      const combined = Array.from(new Set([...participants, ...names]));
      setParticipants(combined);
      setInputValue(combined.join('\n'));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deduplicate = () => {
    const unique = Array.from(new Set(participants));
    setParticipants(unique);
    setInputValue(unique.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Input */}
      <div className="lg:col-span-2 flex flex-col gap-4 p-4 md:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">抽獎名單</label>
            <p className="text-xs text-gray-500 font-medium">支援分號 (;) 或 換行 區分</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-mono font-bold">
              {participants.length} 人
            </span>
            <button 
              onClick={deduplicate}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              移除重複
            </button>
          </div>
        </div>
        
        <textarea
          disabled={isDrawing}
          value={inputValue}
          onChange={handleTextChange}
          spellCheck={false}
          placeholder="請輸入抽獎姓名..."
          className="min-h-[250px] lg:h-full w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-medium placeholder:text-gray-700 transition-all shadow-inner leading-relaxed"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            匯入名單
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt" className="hidden" />
          
          <button 
            onClick={onClear}
            className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all"
          >
            全部清空
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-6 p-4 md:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <label className="text-sm font-black text-gray-400 uppercase tracking-widest">抽獎設定</label>
        
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-black/30 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-300">單次抽取人數</span>
              <span className="text-3xl font-black text-purple-400">{settings.drawCount}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={Math.max(1, participants.length)}
              value={settings.drawCount}
              onChange={(e) => setSettings(prev => ({ ...prev, drawCount: parseInt(e.target.value) || 1 }))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-bold uppercase">
                <span>1</span>
                <span>{participants.length} 人</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-black/30 border border-white/5 shadow-inner">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-300">排除已中獎者</span>
                <span className="text-[10px] text-gray-500 uppercase">避免重複獲獎</span>
            </div>
            <button 
              onClick={() => setSettings(prev => ({ ...prev, excludeWinners: !prev.excludeWinners }))}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.excludeWinners ? 'bg-purple-600 shadow-lg shadow-purple-500/30' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.excludeWinners ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-2">
            <div className="text-center group p-6 rounded-3xl bg-gradient-to-b from-white/5 to-transparent w-full">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-black">當前可抽名額</p>
              <p className="text-6xl font-black text-white group-hover:text-purple-400 transition-colors duration-500">{availableCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleControlPanel;
