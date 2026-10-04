import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { Zap, CheckCircle, Swords, Activity, Trophy, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchDayChecklistProps {
  checklists: ChecklistItem[];
  onToggleItem: (id: string, isChecked: boolean) => void;
}

export const MatchDayChecklist: React.FC<MatchDayChecklistProps> = ({
  checklists,
  onToggleItem,
}) => {
  const [activeTab, setActiveTab] = useState<'sanda' | 'taolu'>('sanda');
  const [isAllReadyTriggered, setIsAllReadyTriggered] = useState(false);

  const sandaItems = checklists.filter((c) => c.category === 'match_day_sanda');
  const taoluItems = checklists.filter((c) => c.category === 'match_day_taolu');

  const currentItems = activeTab === 'sanda' ? sandaItems : taoluItems;
  const completedCount = currentItems.filter((i) => i.isChecked).length;
  const totalCount = currentItems.length;
  const isFullyCompleted = totalCount > 0 && completedCount === totalCount;

  const handleAllReadyClick = () => {
    setIsAllReadyTriggered(true);
    // Fire festive confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-red-900/50 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Match Day Call Room Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Verifikasi kelengkapan fisik, identitas, timbang badan, dan gear atlet sebelum menuju Call Room.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sanda')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'sanda'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>SANDA CALL ROOM</span>
            </button>

            <button
              onClick={() => setActiveTab('taolu')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'taolu'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>TAOLU CALL ROOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Card Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">
              Checklist Kesiapan {activeTab === 'sanda' ? 'Atlet Sanda' : 'Atlet Taolu'}
            </h3>
          </div>

          <span className="text-xs font-bold text-slate-300">
            {completedCount} / {totalCount} Item Terverifikasi
          </span>
        </div>

        {/* Item List */}
        <div className="space-y-3">
          {currentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id, !item.isChecked)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                item.isChecked
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={() => {}} // handled by parent div
                  className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 pointer-events-none"
                />
                <span className="text-sm font-extrabold">{item.title}</span>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  item.isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.isChecked ? '✓ SIAP' : 'BELUM'}
              </span>
            </div>
          ))}
        </div>

        {/* Massive SEMUA SIAP Action Button */}
        <div className="pt-6 border-t border-slate-800 text-center space-y-3">
          <button
            onClick={handleAllReadyClick}
            className={`w-full py-4 rounded-2xl text-base font-black tracking-wider uppercase shadow-2xl transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ${
              isFullyCompleted || isAllReadyTriggered
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white glow-emerald'
                : 'bg-gradient-to-r from-red-600 to-amber-500 text-white glow-red'
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span>SEMUA SIAP MENUJU CALL ROOM!</span>
          </button>

          {isAllReadyTriggered && (
            <p className="text-xs text-emerald-400 font-bold animate-pulse">
              🎉 Kontingen Wushu Siap Tampil Kapan Saja! Semoga Meraih Medali Emas!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
