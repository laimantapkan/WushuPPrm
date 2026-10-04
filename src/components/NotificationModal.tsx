import React from 'react';
import { AppNotification, ChecklistItem, Athlete } from '../types';
import { Bell, X, AlertCircle, CheckCircle, Info, ShieldAlert, CheckSquare } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  checklists?: ChecklistItem[];
  athletes?: Athlete[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  checklists = [],
  athletes = [],
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  // Calculate Checklist Verification Progress
  const totalChecklists = checklists.length;
  const verifiedCount = checklists.filter((c) => c.isChecked).length;
  const progressPercent = totalChecklists > 0 ? Math.round((verifiedCount / totalChecklists) * 100) : 0;

  // Breakdown by category
  const umumItems = checklists.filter((c) => c.category === 'umum');
  const sandaItems = checklists.filter((c) => c.category === 'sanda');
  const taoluItems = checklists.filter((c) => c.category === 'taolu');

  const umumDone = umumItems.filter((c) => c.isChecked).length;
  const sandaDone = sandaItems.filter((c) => c.isChecked).length;
  const taoluDone = taoluItems.filter((c) => c.isChecked).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-white text-base">Notifikasi & Status Verifikasi</h3>
          </div>

          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-400 font-semibold"
          >
            Hapus Semua
          </button>
        </div>

        {/* Progres Verifikasi Checklist Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Progres Verifikasi Checklist Kontingen
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {verifiedCount} / {totalChecklists} ({progressPercent}%)
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Category Progress Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">Berkas & Medis</span>
              <span className="text-emerald-300 font-extrabold">
                {umumDone} / {umumItems.length}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">Gear Sanda</span>
              <span className="text-amber-300 font-extrabold">
                {sandaDone} / {sandaItems.length}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">Gear Taolu</span>
              <span className="text-blue-300 font-extrabold">
                {taoluDone} / {taoluItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List Header */}
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
          Pesan System & Alert
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Tidak ada notifikasi baru.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3.5 rounded-xl border text-xs transition cursor-pointer flex items-start gap-3 ${
                  n.read
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : 'bg-slate-950 border-red-500/40 text-white font-semibold'
                }`}
              >
                {n.type === 'danger' && <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                {n.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}

                <div className="flex-1">
                  <p>{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
