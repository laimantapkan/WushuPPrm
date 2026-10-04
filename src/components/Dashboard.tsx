import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import {
  Users,
  Swords,
  Activity,
  UserCheck,
  CheckCircle2,
  Clock,
  Zap,
  Bus,
  Scale,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  // Checklist calculations
  const totalChecklists = state.checklists.length;
  const completedChecklists = state.checklists.filter((c) => c.isChecked).length;
  const pendingChecklists = totalChecklists - completedChecklists;
  const readinessPercent = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  // Readiness Indicator
  let readinessStatus: { label: string; color: string; bg: string; border: string; icon: string } = {
    label: 'Belum Lengkap',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '🔴',
  };

  if (readinessPercent >= 90) {
    readinessStatus = {
      label: 'Lengkap',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: '🟢',
    };
  } else if (readinessPercent >= 70) {
    readinessStatus = {
      label: 'Hampir Lengkap',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: '🟡',
    };
  }

  // Count athletes
  const totalAthletes = state.athletes.length;
  const sandaAthletes = state.athletes.filter((a) => a.discipline === 'Sanda').length;
  const taoluAthletes = state.athletes.filter((a) => a.discipline === 'Taolu').length;
  const totalCoaches = state.coaches.length;
  const totalOfficials = state.officials.length;

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const matchTime = new Date(state.settings.matchDate).getTime();
      const now = new Date().getTime();
      const diff = matchTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [state.settings.matchDate]);

  // Urgent Notifications / Issues
  const urgentIssues = state.notifications.filter((n) => n.type === 'danger' || n.type === 'warning');

  return (
    <div className="space-y-6">
      {/* Top Banner & Countdown Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-900/40 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full uppercase tracking-wider">
                PORPROV XVI SUMBAR
              </span>
              <span className="text-xs text-slate-300 font-bold">{state.settings.venueLocation}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Kesiapan Kontingen
            </h1>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center min-w-[280px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">
              <Clock className="w-4 h-4" />
              <span>Hitung Mundur Hari Pertandingan</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-xl font-extrabold text-white">{timeLeft.days}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Hari</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-xl font-extrabold text-white">{timeLeft.hours}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Jam</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-xl font-extrabold text-white">{timeLeft.minutes}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Menit</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-xl font-extrabold text-amber-400">{timeLeft.seconds}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Detik</div>
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Progress Bar Component */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-200">Kesiapan Kontingen:</span>
              <span className="text-lg font-extrabold text-white">{readinessPercent}%</span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1 ${readinessStatus.bg} ${readinessStatus.border} ${readinessStatus.color}`}
              >
                <span>{readinessStatus.icon}</span>
                <span>{readinessStatus.label}</span>
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {completedChecklists} dari {totalChecklists} Checklist Selesai
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-700 shadow-md"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Atlet */}
        <div
          onClick={() => onNavigate('atlet')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Atlet</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{totalAthletes} Personel</div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span className="text-amber-400 font-semibold">{sandaAthletes} Sanda</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{taoluAthletes} Taolu</span>
          </div>
        </div>

        {/* Atlet Sanda */}
        <div
          onClick={() => onNavigate('sanda')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Atlet Sanda</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition">
              <Swords className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{sandaAthletes} Tarung</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Timbang Badan</span>
            <span className="text-emerald-400 font-semibold">Monitoring Active</span>
          </div>
        </div>

        {/* Atlet Taolu */}
        <div
          onClick={() => onNavigate('taolu')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Atlet Taolu</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-400">{taoluAthletes} Seni</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Senjata & Musik</span>
            <span className="text-emerald-400 font-semibold">Terdaftar</span>
          </div>
        </div>

        {/* Pelatih & Official */}
        <div
          onClick={() => onNavigate('pelatih')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Pelatih & Official</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{totalCoaches + totalOfficials} Tim</div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>{totalCoaches} Pelatih</span>
            <span>•</span>
            <span>{totalOfficials} Official</span>
          </div>
        </div>
      </div>

      {/* Checklist Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Status Perlengkapan</h3>
            </div>
            <button
              onClick={() => onNavigate('checklist')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-semibold">Checklist Selesai</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{completedChecklists}</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">✓ Siap digunakan</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20">
              <div className="text-xs text-slate-400 font-semibold">Checklist Belum Selesai</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{pendingChecklists}</div>
              <div className="text-[11px] text-amber-500/80 mt-1">! Perlu dilengkapi</div>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-2">Akses Cepat Modul Kontingen</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pilih tindakan langsung untuk memantau keberangkatan, timbang badan, atau hari pertandingan.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onNavigate('timbang')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-center transition"
            >
              <Scale className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Timbang Sanda</span>
            </button>

            <button
              onClick={() => onNavigate('matchday')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-center transition"
            >
              <Zap className="w-5 h-5 text-red-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Match Day</span>
            </button>

            <button
              onClick={() => onNavigate('keberangkatan')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-center transition"
            >
              <Bus className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Keberangkatan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Notifications Widget */}
      {urgentIssues.length > 0 && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Peringatan & Catatan Penting Kontingen</span>
          </div>
          <div className="space-y-2">
            {urgentIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border text-xs flex items-start justify-between ${
                  issue.type === 'danger'
                    ? 'bg-red-950/40 border-red-500/30 text-red-200'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                }`}
              >
                <span>{issue.message}</span>
                <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">{issue.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
