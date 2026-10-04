import React, { useState } from 'react';
import { Athlete, WeighInLog } from '../types';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  AlertTriangle,
  History,
  Calendar,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface SandaWeighInProps {
  sandaAthletes: Athlete[];
  weighInLogs: WeighInLog[];
  onAddWeighInLog: (log: WeighInLog, updatedAthleteWeight: number) => void;
}

export const SandaWeighIn: React.FC<SandaWeighInProps> = ({
  sandaAthletes,
  weighInLogs,
  onAddWeighInLog,
}) => {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    sandaAthletes[0]?.id || ''
  );

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState<number>(56);
  const [inputNotes, setInputNotes] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 10));
  const [inputTime, setInputTime] = useState('07:00');

  const currentAthlete = sandaAthletes.find((a) => a.id === selectedAthleteId);

  // Filter weigh in logs for selected athlete
  const athleteLogs = weighInLogs
    .filter((l) => l.athleteId === selectedAthleteId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare chart data
  const chartData = athleteLogs.map((log) => ({
    date: log.date.slice(5), // MM-DD
    weight: log.weight,
    target: log.targetWeight,
  }));

  const handleOpenInputModal = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.id);
    setInputWeight(athlete.weight);
    setInputNotes('');
    setIsInputModalOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAthlete) return;

    const targetWeight = currentAthlete.targetWeight;
    const diff = inputWeight - targetWeight;
    let status: 'sesuai' | 'mendekati' | 'diatas' = 'sesuai';
    if (diff > 1.5) status = 'diatas';
    else if (diff > 0) status = 'mendekati';

    const newLog: WeighInLog = {
      id: `log-${Date.now()}`,
      athleteId: currentAthlete.id,
      athleteName: currentAthlete.name,
      weightClass: currentAthlete.sandaDetails?.weightClass || `${targetWeight} kg`,
      date: inputDate,
      time: inputTime,
      weight: inputWeight,
      targetWeight: targetWeight,
      status,
      notes: inputNotes,
    };

    onAddWeighInLog(newLog, inputWeight);
    setIsInputModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">Modul Weight Management Sanda</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring berat badan atlet Sanda secara berkala menuju batas resmi timbang badan Porprov.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentAthlete && (
            <button
              onClick={() => handleOpenInputModal(currentAthlete)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Input Penimbangan Harian</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <strong className="font-bold text-amber-300 block mb-0.5">
            Pernyataan Kepatuhan & Kesehatan Atlet:
          </strong>
          Modul ini khusus digunakan untuk pencatatan & monitoring berkala oleh pelatih dan tim fisioterapi. Modul ini tidak memberikan rekomendasi dehidrasi ekstrem atau metode berisiko. Seluruh program penurunan berat badan wajib dikonsultasikan dengan tim medis/dokter kontingen.
        </div>
      </div>

      {/* Athletes Weight Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sandaAthletes.map((athlete) => {
          const currentW = athlete.weight;
          const targetW = athlete.targetWeight;
          const diff = Number((currentW - targetW).toFixed(1));

          let statusInfo = {
            badge: '🟢 Sesuai Target',
            bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
            cardBorder: selectedAthleteId === athlete.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800',
          };

          if (diff > 1.5) {
            statusInfo = {
              badge: '🔴 Di Atas Target',
              bg: 'bg-red-500/10 border-red-500/30 text-red-400',
              cardBorder: selectedAthleteId === athlete.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800',
            };
          } else if (diff > 0) {
            statusInfo = {
              badge: '🟡 Mendekati Target',
              bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
              cardBorder: selectedAthleteId === athlete.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800',
            };
          }

          return (
            <div
              key={athlete.id}
              onClick={() => setSelectedAthleteId(athlete.id)}
              className={`bg-slate-900 border ${statusInfo.cardBorder} p-5 rounded-2xl cursor-pointer hover:border-amber-500/60 transition shadow-lg relative`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-amber-400">
                  {athlete.sandaDetails?.weightClass || `Kelas ${targetW} kg`}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusInfo.bg}`}>
                  {statusInfo.badge}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">{athlete.name}</h3>

              <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Saat Ini</div>
                  <div className="text-sm font-extrabold text-white">{currentW} kg</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Target</div>
                  <div className="text-sm font-extrabold text-emerald-400">{targetW} kg</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Selisih</div>
                  <div className={`text-sm font-extrabold ${diff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {diff > 0 ? `+${diff}` : `${diff}`} kg
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Timbang Resmi: {athlete.sandaDetails?.weighInSchedule || '15 Juli 06:30'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenInputModal(athlete);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  + Input BB
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Athlete Progression Chart & History */}
      {currentAthlete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart View */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Grafik Perkembangan Berat: <span className="text-amber-400">{currentAthlete.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Garis kuning menunjukkan catatan penimbangan, garis hijau menunjukkan batas kelas ({currentAthlete.targetWeight} kg).
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Berat Badan (kg)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#f59e0b' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target Resmi (kg)"
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                Belum ada riwayat penimbangan untuk atlet ini.
              </div>
            )}
          </div>

          {/* History Log List */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
                <History className="w-4 h-4 text-amber-400" />
                <span>Riwayat Penimbangan Harian</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {athleteLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada riwayat.</p>
                ) : (
                  athleteLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-300">
                          {log.date} ({log.time})
                        </span>
                        <span className="text-amber-400">{log.weight} kg</span>
                      </div>
                      {log.notes && <p className="text-slate-400 text-[11px] italic">{log.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => handleOpenInputModal(currentAthlete)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition"
              >
                + Tambah Catatan Timbang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Weight Modal */}
      {isInputModalOpen && currentAthlete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-2">Input Penimbangan Harian</h3>
            <p className="text-xs text-amber-400 font-semibold mb-4">
              Atlet: {currentAthlete.name} (Target: {currentAthlete.targetWeight} kg)
            </p>

            <form onSubmit={handleSaveLog} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jam Timbang</label>
                  <input
                    type="text"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    placeholder="07:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hasil Berat Badan (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-400 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Kondisi</label>
                <textarea
                  rows={2}
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="mis. Timbang sebelum sarapan, kondisi fit."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow"
                >
                  Simpan Timbang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
