import React from 'react';
import { motion } from 'framer-motion';
import { SavingsGoal } from '../types';
import { Target, CheckCircle2 } from 'lucide-react';

interface SavingsMirrorProps {
  goals: SavingsGoal[];
  className?: string;
  hideFooter?: boolean;
}

export function SavingsMirror({ goals, className = "", hideFooter = false }: SavingsMirrorProps) {
  const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS').slice(0, 3);
  
  return (
    <div className={`relative bg-slate-900/40 backdrop-blur-2xl border border-white/20 p-5 rounded-[2.2rem] shadow-2xl overflow-hidden ${className}`}>
      {/* Glass Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col gap-3 relative z-10">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal, idx) => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            return (
              <div key={goal.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  <span className="truncate max-w-[140px]">{goal.title}</span>
                  <span className="text-emerald-400">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.2 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-4 opacity-30">
            <Target className="w-10 h-10 mb-2 text-white/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Sem metas ativas</span>
          </div>
        )}
      </div>
      
      {!hideFooter && (
        <div className="mt-4 flex items-center gap-2.5 px-1 relative z-10">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute inset-0" />
            <div className="w-2 h-2 rounded-full bg-amber-400 relative" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Objetivos Live</span>
        </div>
      )}
    </div>
  );
}
