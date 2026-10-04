import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { Bus, CheckCircle2, ShieldCheck, Truck, Users, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DepartureChecklistProps {
  checklists: ChecklistItem[];
  onToggleItem: (id: string, isChecked: boolean) => void;
}

export const DepartureChecklist: React.FC<DepartureChecklistProps> = ({
  checklists,
  onToggleItem,
}) => {
  const departureItems = checklists.filter((c) => c.category === 'departure');
  const completedCount = departureItems.filter((i) => i.isChecked).length;
  const totalCount = departureItems.length;
  const isAllChecked = totalCount > 0 && completedCount === totalCount;
  const [isDeparted, setIsDeparted] = useState(false);

  const handleDepartTrigger = () => {
    setIsDeparted(true);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/60 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bus className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Keberangkatan Kontingen Porprov 2026</h2>
          </div>
          <p className="text-xs text-slate-300">
            Verifikasi fisik seluruh personel, kendaraan, akomodasi, dan pemuatan peralatan ke bus kontingen.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Status Keberangkatan</div>
          <div
            className={`text-sm font-black ${
              isDeparted ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isDeparted ? '✓ KONTINGEN DALAM PERJALANAN' : '⏳ DALAM VERIFIKASI'}
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-sm font-bold text-white">Daftar Verifikasi Keberangkatan</span>
          <span className="text-xs font-bold text-emerald-400">
            {completedCount} / {totalCount} Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departureItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id, !item.isChecked)}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                item.isChecked
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 pointer-events-none"
                />
                <span className="text-xs font-bold">{item.title}</span>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  item.isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.isChecked ? 'LENGKAP' : 'BELUM'}
              </span>
            </div>
          ))}
        </div>

        {/* Big Action Button */}
        <div className="pt-6 border-t border-slate-800 text-center space-y-3">
          <button
            onClick={handleDepartTrigger}
            className="w-full py-5 rounded-2xl text-lg font-black tracking-wider uppercase bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-2xl glow-emerald transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <Bus className="w-7 h-7" />
            <span>✓ KONTINGEN SIAP BERANGKAT</span>
          </button>

          {isDeparted && (
            <p className="text-sm font-extrabold text-emerald-400 animate-bounce pt-2">
              🚍 SELAMAT JALAN KONTINGEN WUSHU PORPROV 2026! JUARA!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
