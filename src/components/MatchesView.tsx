import React, { useState } from 'react';
import { MatchSchedule, MatchStatus, Discipline } from '../types';
import {
  Calendar,
  Swords,
  Activity,
  MapPin,
  Clock,
  Plus,
  Table as TableIcon,
  Award,
  Scale,
  Users2,
  CheckCircle2,
} from 'lucide-react';

interface MatchesViewProps {
  matches: MatchSchedule[];
  onUpdateMatchStatus: (matchId: string, status: MatchStatus) => void;
  onAddMatch: (match: MatchSchedule) => void;
  onDeleteMatch: (matchId: string) => void;
}

interface OfficialRundownDay {
  dayTag: string;
  dateStr: string;
  dateIso: string;
  items: {
    time: string;
    activity: string;
    type?: 'admin' | 'weigh' | 'match' | 'ceremony';
  }[];
}

const OFFICIAL_RUNDOWN: OfficialRundownDay[] = [
  {
    dayTag: '- H 1',
    dateStr: '5 Oktober 2026',
    dateIso: '2026-10-05',
    items: [
      { time: '07.00 – 17.00 WIB', activity: '1. Kedatangan Peserta dan Registrasi Ulang', type: 'admin' },
      { time: '07.00 – 17.00 WIB', activity: '2. Kedatangan TD, Perangkat Pertandingan, Wasjur', type: 'admin' },
    ],
  },
  {
    dayTag: 'H – 1',
    dateStr: '6 Oktober 2026',
    dateIso: '2026-10-06',
    items: [
      { time: '07.00 – 08.00 WIB', activity: '1. Timbang berat Badan atlet Sanda', type: 'weigh' },
      { time: '10.00 – 17.00 WIB', activity: '2. Uji Coba Lapangan', type: 'admin' },
      { time: '14.00 – Selesai', activity: '3. Technical Meeting (TM)', type: 'admin' },
    ],
  },
  {
    dayTag: 'H – 2',
    dateStr: '7 Oktober 2026',
    dateIso: '2026-10-07',
    items: [
      { time: '07.00 – 08.00 WIB', activity: '1. Timbang badan atlet Sanda (bertanding)', type: 'weigh' },
      { time: '09.00 – Selesai', activity: '2. Pertandingan Wushu Taolu (sesuai jadwal)', type: 'match' },
      { time: '09.00 – Selesai', activity: '3. Pertandingan Wushu Sanda (sesuai jadwal)', type: 'match' },
    ],
  },
  {
    dayTag: 'H – 3',
    dateStr: '8 Oktober 2026',
    dateIso: '2026-10-08',
    items: [
      { time: '07.00 – 08.00 WIB', activity: '1. Timbang badan atlet Sanda (bertanding)', type: 'weigh' },
      { time: '09.00 – Selesai', activity: '2. Pertandingan Wushu Taolu (sesuai jadwal)', type: 'match' },
      { time: '09.00 – Selesai', activity: '3. Pertandingan Wushu Sanda (sesuai jadwal)', type: 'match' },
    ],
  },
  {
    dayTag: 'H – 4',
    dateStr: '9 Oktober 2026',
    dateIso: '2026-10-09',
    items: [
      { time: '07.00 – 08.00 WIB', activity: '1. Timbang badan atlet Sanda (bertanding)', type: 'weigh' },
      { time: '09.00 – Selesai', activity: '2. Pertandingan Wushu Taolu (sesuai jadwal)', type: 'match' },
      { time: '09.00 – Selesai', activity: '3. Pertandingan Wushu Sanda (sesuai jadwal)', type: 'match' },
    ],
  },
  {
    dayTag: 'H – 5',
    dateStr: '10 Oktober 2026',
    dateIso: '2026-10-10',
    items: [
      { time: '07.00 – 08.00 WIB', activity: '1. Timbang badan atlet Sanda (bertanding)', type: 'weigh' },
      { time: '09.00 – Selesai', activity: '2. Pertandingan Wushu Taolu (sesuai jadwal)', type: 'match' },
      { time: '09.00 – Selesai', activity: '3. Pertandingan Wushu Sanda (sesuai jadwal)', type: 'match' },
      { time: 'Selesai Pertandingan', activity: '4. UPP untuk Wushu Taolu dan Wushu Sanda (Penyerahan Medali)', type: 'ceremony' },
    ],
  },
];

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  onUpdateMatchStatus,
  onAddMatch,
  onDeleteMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'rundown' | 'matches'>('rundown');
  const [filterDiscipline, setFilterDiscipline] = useState<Discipline | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'ALL'>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');

  // New Match Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [athleteName, setAthleteName] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('Sanda');
  const [matchCategory, setMatchCategory] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [date, setDate] = useState('2026-10-07');
  const [time, setTime] = useState('09:00');
  const [venue, setVenue] = useState('Sport Hall Atas Ngarai Bukittinggi');
  const [status, setStatus] = useState<MatchStatus>('Belum bertanding');
  const [notes, setNotes] = useState('');

  // Sanda Extra
  const [opponent, setOpponent] = useState('');
  const [round, setRound] = useState('Babak Penyisihan');

  // Taolu Extra
  const [taoluNumber, setTaoluNumber] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [weapon, setWeapon] = useState('');

  const filteredMatches = matches.filter((m) => {
    const matchDisc = filterDiscipline === 'ALL' || m.discipline === filterDiscipline;
    const matchStat = filterStatus === 'ALL' || m.status === filterStatus;
    const matchDate = filterDate === 'ALL' || m.date === filterDate;
    return matchDisc && matchStat && matchDate;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName.trim()) return;

    const newMatch: MatchSchedule = {
      id: `mtc-${Date.now()}`,
      athleteId: `atl-${Date.now()}`,
      athleteName,
      discipline,
      matchCategory,
      matchNumber: matchNumber || (discipline === 'Sanda' ? 'PARTAI 01' : 'URUTAN 01'),
      date,
      time,
      venue,
      status,
      notes,
      sandaExtra:
        discipline === 'Sanda'
          ? {
              weighInTime: `${date} 07:00`,
              weighInResult: 'Timbang Pagi Wajib (07.00 - 08.00 WIB)',
              opponent: opponent || 'Menunggu Undian',
              round,
            }
          : undefined,
      taoluExtra:
        discipline === 'Taolu'
          ? {
              taoluNumber: taoluNumber || matchCategory,
              orderIndex,
              weapon: weapon || 'Tangan Kosong / Senjata',
            }
          : undefined,
    };

    onAddMatch(newMatch);
    setIsModalOpen(false);
  };

  const getStatusBadge = (st: MatchStatus) => {
    switch (st) {
      case 'Sedang bertanding':
        return (
          <span className="px-2.5 py-1 text-xs font-black bg-red-600 text-white rounded-full animate-pulse">
            🔥 SEDANG BERTANDING
          </span>
        );
      case 'Persiapan':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
            ⏳ PERSIAPAN CALL ROOM
          </span>
        );
      case 'Selesai':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
            ✓ SELESAI
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-slate-800 text-slate-300 rounded-full">
            ⏱ BELUM BERTANDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Jadwal Pertandingan Wushu Porprov</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Jadwal resmi PORPROV XVI SUMBAR 2026 (5 - 10 Oktober 2026) di Sport Hall Atas Ngarai Bukittinggi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-xs font-bold shadow-lg hover:from-red-500 hover:to-red-600 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jadwal Match</span>
        </button>
      </div>

      {/* Main Mode Tabs: Rundown Resmi vs Daftar Partai Atlet */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('rundown')}
          className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'rundown'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TableIcon className="w-5 h-5" />
          <span>Jadwal Resmi Porprov (5 - 10 Okt)</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'matches'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Swords className="w-5 h-5" />
          <span>Daftar Partai Atlet ({matches.length} Match)</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL RUNDOWN TABLE (Gambar 2) */}
      {activeTab === 'rundown' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                  Tabel Resmi Jadwal Acara Pertandingan Wushu Porprov XVI
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Venue: Sport Hall Atas Ngarai Bukittinggi
              </span>
            </div>

            {/* Structured Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-44">HARI KE-</th>
                    <th className="py-3 px-4 w-48">WAKTU</th>
                    <th className="py-3 px-4">ACARA / KEGIATAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {OFFICIAL_RUNDOWN.map((row, idx) => (
                    <tr
                      key={row.dayTag}
                      className={idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80'}
                    >
                      {/* Hari & Tanggal */}
                      <td className="py-4 px-4 align-top font-bold">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black mb-1">
                          {row.dayTag}
                        </span>
                        <div className="text-white font-extrabold text-sm">{row.dateStr}</div>
                      </td>

                      {/* Waktu */}
                      <td className="py-4 px-4 align-top space-y-2">
                        {row.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-1.5 font-semibold text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{it.time}</span>
                          </div>
                        ))}
                      </td>

                      {/* Acara */}
                      <td className="py-4 px-4 align-top space-y-2">
                        {row.items.map((it, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-xl text-xs flex items-start gap-2 border ${
                              it.type === 'match'
                                ? 'bg-red-950/20 border-red-500/30 text-white font-bold'
                                : it.type === 'weigh'
                                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200 font-semibold'
                                : it.type === 'ceremony'
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            {it.type === 'match' && <Swords className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                            {it.type === 'weigh' && <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                            {it.type === 'ceremony' && <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                            {it.type === 'admin' && <Users2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                            <span>{it.activity}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR PARTAI ATLET KONTINGEN */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterDiscipline('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    filterDiscipline === 'ALL' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua Cabang
                </button>
                <button
                  onClick={() => setFilterDiscipline('Sanda')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    filterDiscipline === 'Sanda' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Sanda</span>
                </button>
                <button
                  onClick={() => setFilterDiscipline('Taolu')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    filterDiscipline === 'Taolu' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Taolu</span>
                </button>
              </div>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-semibold"
              >
                <option value="ALL">Semua Tanggal Pertandingan</option>
                <option value="2026-10-07">H-2 (07 Oktober 2026)</option>
                <option value="2026-10-08">H-3 (08 Oktober 2026)</option>
                <option value="2026-10-09">H-4 (09 Oktober 2026)</option>
                <option value="2026-10-10">H-5 (10 Oktober 2026)</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-semibold"
            >
              <option value="ALL">Semua Status Match</option>
              <option value="Belum bertanding">Belum Bertanding</option>
              <option value="Persiapan">Persiapan Call Room</option>
              <option value="Sedang bertanding">Sedang Bertanding</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Match Cards List */}
          {filteredMatches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Swords className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">Tidak ada jadwal match ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter cabang atau tanggal tanding.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((m) => {
                const isSanda = m.discipline === 'Sanda';
                return (
                  <div
                    key={m.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-2.5 rounded-xl ${
                            isSanda ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {isSanda ? <Swords className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-red-400 uppercase">{m.matchNumber}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs font-bold text-slate-300">{m.matchCategory}</span>
                          </div>
                          <h3 className="text-lg font-extrabold text-white mt-0.5">{m.athleteName}</h3>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-3">
                        {getStatusBadge(m.status)}

                        <select
                          value={m.status}
                          onChange={(e) => onUpdateMatchStatus(m.id, e.target.value as MatchStatus)}
                          className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-red-500"
                        >
                          <option value="Belum bertanding">Belum Bertanding</option>
                          <option value="Persiapan">Persiapan Call Room</option>
                          <option value="Sedang bertanding">Sedang Bertanding</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </div>

                    {/* Match Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          Tanggal: <strong>{m.date}</strong> ({m.time} WIB)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{m.venue}</span>
                      </div>

                      {isSanda ? (
                        <div className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold block mb-0.5">Sanda Detail:</span>
                          <div>
                            Lawan: <strong>{m.sandaExtra?.opponent || 'Menunggu Undian'}</strong>
                          </div>
                          <div>Babak: {m.sandaExtra?.round || 'Babak Penyisihan'}</div>
                        </div>
                      ) : (
                        <div className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-blue-400 font-bold block mb-0.5">Taolu Detail:</span>
                          <div>
                            Urutan Tampil: <strong>#{m.taoluExtra?.orderIndex || 1}</strong>
                          </div>
                          <div>Senjata: {m.taoluExtra?.weapon || 'Tangan Kosong'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Match Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-white mb-4">Tambah Jadwal Pertandingan Baru</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cabang</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as Discipline)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Sanda">Sanda</option>
                    <option value="Taolu">Taolu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Atlet *</label>
                  <input
                    type="text"
                    required
                    value={athleteName}
                    onChange={(e) => setAthleteName(e.target.value)}
                    placeholder="Nama atlet..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori / Nomor *</label>
                <input
                  type="text"
                  required
                  value={matchCategory}
                  onChange={(e) => setMatchCategory(e.target.value)}
                  placeholder="mis. Sanda Senior Putra 56 kg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Partai / Urutan</label>
                  <input
                    type="text"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(e.target.value)}
                    placeholder="PARTAI 05"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                  >
                    <option value="2026-10-05">- H 1 (05 Oktober 2026)</option>
                    <option value="2026-10-06">H - 1 (06 Oktober 2026)</option>
                    <option value="2026-10-07">H - 2 (07 Oktober 2026)</option>
                    <option value="2026-10-08">H - 3 (08 Oktober 2026)</option>
                    <option value="2026-10-09">H - 4 (09 Oktober 2026)</option>
                    <option value="2026-10-10">H - 5 (10 Oktober 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jam</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="09:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue / GOR</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {discipline === 'Sanda' ? (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-amber-400">Lawan Tanding (Kontingen Lawan)</label>
                  <input
                    type="text"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="Kontingen Kab. Agam"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              ) : (
                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-blue-400">Urutan Tampil Taolu</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
