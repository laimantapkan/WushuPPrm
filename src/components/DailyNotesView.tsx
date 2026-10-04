import React, { useState } from 'react';
import { DailyNote, DailyNoteCategory, Athlete } from '../types';
import { BookOpen, Plus, Search, Calendar, Clock, User, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

interface DailyNotesViewProps {
  notes: DailyNote[];
  athletes: Athlete[];
  onSaveNote: (note: DailyNote) => void;
  onDeleteNote: (id: string) => void;
}

export const DailyNotesView: React.FC<DailyNotesViewProps> = ({
  notes,
  athletes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);

  // Form State
  const [formDate, setFormDate] = useState('2026-10-05');
  const [formTime, setFormTime] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<DailyNoteCategory>('Pertandingan');
  const [formAthleteId, setFormAthleteId] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');

  const porprovDates = [
    { value: '2026-10-05', label: '05 Oktober 2026' },
    { value: '2026-10-06', label: '06 Oktober 2026' },
    { value: '2026-10-07', label: '07 Oktober 2026' },
    { value: '2026-10-08', label: '08 Oktober 2026' },
    { value: '2026-10-09', label: '09 Oktober 2026' },
    { value: '2026-10-10', label: '10 Oktober 2026' },
  ];

  const categories: DailyNoteCategory[] = [
    'Pertandingan',
    'Kondisi Atlet',
    'Evaluasi',
    'Cedera',
    'Jadwal',
    'Lainnya',
  ];

  const categoryBadges: Record<DailyNoteCategory, { bg: string; text: string; border: string }> = {
    Pertandingan: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    'Kondisi Atlet': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Evaluasi: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    Cedera: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' },
    Jadwal: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    Lainnya: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
  };

  const formatDateIndo = (dateStr: string) => {
    const found = porprovDates.find((d) => d.value === dateStr);
    if (found) return found.label;

    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const day = parts[2];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  const handleOpenModal = (note?: DailyNote) => {
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);

    if (note) {
      setEditingNote(note);
      setFormDate(note.date || '2026-10-05');
      setFormTime(note.time || timeStr);
      setFormTitle(note.title);
      setFormCategory(note.category);
      setFormAthleteId(note.athleteId || '');
      setFormContent(note.content);
      setFormFollowUp(note.followUp || '');
    } else {
      setEditingNote(null);
      setFormDate('2026-10-05');
      setFormTime(timeStr);
      setFormTitle('');
      setFormCategory('Pertandingan');
      setFormAthleteId('');
      setFormContent('');
      setFormFollowUp('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const selectedAthlete = athletes.find((a) => a.id === formAthleteId);

    const updatedNote: DailyNote = {
      id: editingNote?.id || `note-${Date.now()}`,
      date: formDate || '2026-10-05',
      time: formTime || '08:00',
      title: formTitle,
      category: formCategory,
      athleteId: formAthleteId || undefined,
      athleteName: selectedAthlete ? selectedAthlete.name : undefined,
      content: formContent,
      followUp: formFollowUp || undefined,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveNote(updatedNote);
    setIsModalOpen(false);
  };

  // Filter & Sort (Newest first)
  const filteredNotes = notes
    .filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.athleteName && n.athleteName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.followUp && n.followUp.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDate = selectedDateFilter ? n.date === selectedDateFilter : true;
      const matchCat = selectedCategoryFilter !== 'ALL' ? n.category === selectedCategoryFilter : true;

      return matchSearch && matchDate && matchCat;
    })
    .sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}`;
      const dateTimeB = `${b.date}T${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Catatan Harian Tim Wushu</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Jurnal evaluasi tanding & kondisi atlet PORPROV XVI SUMBAR (05 Oktober - 10 Oktober 2026).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Catatan</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul, kejadian, nama atlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Date & Category Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Range Dropdown (05 - 10 Oktober) */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-red-400 shrink-0" />
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">
                📅 Semua Tanggal (05 Okt - 10 Okt)
              </option>
              {porprovDates.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-900 text-white font-medium">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List Feed */}
      {filteredNotes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Tidak Ada Catatan Harian</h3>
          <p className="text-xs text-slate-500 mt-1">
            Belum ada catatan untuk filter ini. Klik tombol "+ Tambah Catatan" untuk membuat catatan baru.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const badge = categoryBadges[note.category] || categoryBadges.Lainnya;

            return (
              <div
                key={note.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-bold text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-red-400" />
                        <span>{formatDateIndo(note.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{note.time} WIB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {note.category}
                      </span>
                      {note.athleteName && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-slate-950 text-amber-300 border border-slate-800 rounded-full">
                          <User className="w-3 h-3 text-amber-400" />
                          <span>{note.athleteName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-base font-extrabold text-white mb-2">{note.title}</h3>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {note.content}
                  </p>

                  {/* Follow up if exists */}
                  {note.followUp && (
                    <div className="mt-3 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-emerald-400 block text-[11px] uppercase">
                          Tindak Lanjut / Solusi:
                        </span>
                        <p className="mt-0.5">{note.followUp}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => handleOpenModal(note)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan "${note.title}"?`)) onDeleteNote(note.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white mb-4">
              {editingNote ? 'Edit Catatan Harian' : 'Tambah Catatan Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Date Dropdown & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal (05 - 10 Okt) *</label>
                  <select
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    {porprovDates.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Catatan *</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Evaluasi Pertandingan Penyisihan / Penanganan Cedera"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Category & Athlete Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DailyNoteCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Atlet Terkait (Opsional)
                  </label>
                  <select
                    value={formAthleteId}
                    onChange={(e) => setFormAthleteId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Umum / Semua --</option>
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.discipline})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Catatan *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan kejadian penting, poin evaluasi, stamina, strategi, atau catatan medis..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Follow Up */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tindak Lanjut / Solusi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="mis. Berikan kompres es & massage jam 19.00 / briefing ulang taktik tendangan samping."
                  value={formFollowUp}
                  onChange={(e) => setFormFollowUp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
