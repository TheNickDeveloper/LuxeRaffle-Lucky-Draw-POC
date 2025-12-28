
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

interface Props {
  isDrawing: boolean;
  participants: string[];
  drawCount: number;
  onFinish: (winners: string[]) => void;
  currentWinners: string[];
}

const RaffleDisplay: React.FC<Props> = ({ isDrawing, participants, drawCount, onFinish, currentWinners }) => {
  const [reels, setReels] = useState<string[][]>([]);
  
  // 佈局配置：針對垂直排列優化
  const layout = useMemo(() => {
    const count = drawCount || 1;
    let h = 140; // 插槽高度
    let fs = 'text-4xl md:text-6xl';
    let containerClass = 'flex-col max-w-2xl w-full'; // 強制垂直排列
    let itemWidth = 'w-full';

    if (count === 1) {
      h = 200; fs = 'text-6xl md:text-8xl';
    } else if (count <= 3) {
      h = 160; fs = 'text-4xl md:text-6xl';
    } else {
      h = 100; fs = 'text-3xl md:text-5xl';
    }

    return { h, fs, containerClass, itemWidth, reelSize: 40 };
  }, [drawCount]);

  // 1. 初始化邏輯：處理 READY 狀態與恢復已有的中獎結果
  useEffect(() => {
    if (isDrawing) return;

    if (currentWinners.length > 0) {
      // 恢復之前的中獎結果
      setReels(currentWinners.map(winner => [winner]));
    } else {
      // 顯示準備狀態
      setReels(Array(drawCount).fill(["READY"]));
    }
  }, [drawCount, isDrawing, currentWinners]);

  // 2. 抽獎動畫邏輯
  useEffect(() => {
    if (isDrawing && participants.length > 0) {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, drawCount);
      
      const newReels = winners.map(winner => {
        const pool = Array.from({ length: layout.reelSize - 1 }, () => 
          participants[Math.floor(Math.random() * participants.length)]
        );
        return [...pool, winner];
      });

      setReels(newReels);

      const duration = 3.5; // 動畫時長
      const timer = setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#ffffff'],
          zIndex: 100
        });
        onFinish(winners);
      }, (duration * 1000) + 100);

      return () => clearTimeout(timer);
    }
  }, [isDrawing, participants, drawCount, layout.reelSize, onFinish]);

  return (
    <div className={`flex items-center gap-4 md:gap-6 p-4 mx-auto ${layout.containerClass}`}>
      {reels.map((reel, idx) => {
        const hasResult = currentWinners.length > 0;
        const isWinnerState = !isDrawing && hasResult;
        
        // 老虎機動畫的核心：位移計算
        const targetY = (isDrawing || (isWinnerState && reel.length > 1)) ? -(reel.length - 1) * layout.h : 0;

        return (
          <motion.div
            key={`slot-${idx}-${drawCount}-${reel.length}`}
            initial={{ opacity: 0, scale: 0.98 }} // 移除 x: -20，改為微縮放
            animate={{ opacity: 1, scale: 1 }}
            className={`
              relative flex flex-col items-center justify-center overflow-hidden
              bg-white/5 border rounded-[1.5rem] md:rounded-[2.5rem] backdrop-blur-xl
              ${layout.itemWidth}
              ${isWinnerState ? 'border-purple-500 ring-4 ring-purple-500/20 z-20 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-white/10 shadow-inner'}
              transition-all duration-700
            `}
            style={{ height: layout.h }}
          >
            {/* 視覺裝飾遮罩 - 漸層效果 */}
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
            
            <div className="absolute top-3 inset-x-0 flex justify-center z-20 opacity-30">
              <span className="text-[10px] font-black tracking-[0.4em] text-purple-400 uppercase">
                {isDrawing ? "Rolling" : (isWinnerState ? "Lucky Winner" : `Slot ${idx + 1}`)}
              </span>
            </div>

            {/* 捲軸內容 */}
            <div className="w-full h-full flex flex-col items-center">
              <motion.div
                animate={{ y: targetY }}
                transition={{
                  duration: isDrawing ? 3.5 : 0.5,
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="flex flex-col items-center w-full"
              >
                {reel.map((name, nameIdx) => (
                  <div 
                    key={`${idx}-${nameIdx}-${name}`} 
                    className="flex items-center justify-center w-full px-4 shrink-0"
                    style={{ height: layout.h }}
                  >
                    <span className={`
                      ${layout.fs} font-black tracking-tighter text-center truncate w-full px-6
                      transition-all duration-300
                      ${isDrawing ? 'text-white/60 blur-[0.8px]' : 'text-white'}
                      ${(isWinnerState && nameIdx === reel.length - 1) 
                        ? 'text-white drop-shadow-[0_0_25px_rgba(168,85,247,1)] scale-110' 
                        : (name === "READY" ? 'text-white/10 italic font-medium' : '')}
                    `}>
                      {name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 中獎時的掃光效果 */}
            {isWinnerState && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none"
              />
            )}
          </motion.div>
        );
      })}

      {participants.length === 0 && !isDrawing && currentWinners.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center opacity-20">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          <p className="text-xl font-black uppercase tracking-widest">
            Waiting for Names
          </p>
        </div>
      )}
    </div>
  );
};

export default RaffleDisplay;
