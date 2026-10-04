import React, { useState } from 'react';
import { ChecklistItem, ConditionStatus, Athlete, Discipline } from '../types';
import {
  CheckSquare,
  Plus,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Package,
  User,
  Users,
  Check,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';

interface ChecklistsViewProps {
  checklists: ChecklistItem[];
  athletes?: Athlete[];
  onToggleItem: (id: string, isChecked: boolean) => void;
  onUpdateItem: (item: ChecklistItem) => void;
  onAddItem: (item: Omit<ChecklistItem, 'id' | 'updatedAt'>) => void;
  onToggleAthleteDoc?: (
    athleteId: string,
    docKey: 'suratPembebasan' | 'aktaIjazahKtp' | 'suketKesehatan',
    checked: boolean
  ) => void;
  onSetAthleteAllDocs?: (athleteId: string, isComplete: boolean) => void;
  onSetAllAthletesAllDocs?: (isComplete: boolean) => void;
}

export const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  checklists,
  athletes = [],
  onToggleItem,
  onUpdateItem,
  onAddItem,
  onToggleAthleteDoc,
  onSetAthleteAllDocs,
  onSetAllAthletesAllDocs,
}) => {
  const [activeCategory, setActiveCategory] = useState<'dokumen' | 'perlengkapan'>('dokumen');
  const [searchQuery, setSearchQuery] = useState('');
  const [athleteDisciplineFilter, setAthleteDisciplineFilter] = useState<'ALL' | Discipline>('ALL');
  const [athleteDocStatusFilter, setAthleteDocStatusFilter] = useState<'ALL' | 'Lengkap' | 'Belum Lengkap'>('ALL');

  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  // New Item Modal State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'dokumen' | 'perlengkapan'>('perlengkapan');
  const [newIsChecked, setNewIsChecked] = useState(false);
  const [newQuantity, setNewQuantity] = useState(14);
  const [newCondition, setNewCondition] = useState<ConditionStatus>('Bagus');
  const [newNote, setNewNote] = useState('');

  // Fallback default doc checklist for an athlete
  const getDocChecklist = (a: Athlete) => {
    const isComp = a.docStatus === 'Lengkap';
    return {
      suratPembebasan: a.docChecklist?.suratPembebasan ?? isComp,
      aktaIjazahKtp: a.docChecklist?.aktaIjazahKtp ?? isComp,
      suketKesehatan: a.docChecklist?.suketKesehatan ?? isComp,
    };
  };

  // Athlete doc metrics
  const totalAthletes = athletes.length;
  const completeAthletes = athletes.filter((a) => {
    const doc = getDocChecklist(a);
    return doc.suratPembebasan && doc.aktaIjazahKtp && doc.suketKesehatan;
  }).length;
  const athleteDocPercent = totalAthletes > 0 ? Math.round((completeAthletes / totalAthletes) * 100) : 0;

  const countSuratPembebasan = athletes.filter((a) => getDocChecklist(a).suratPembebasan).length;
  const countAktaIjazah = athletes.filter((a) => getDocChecklist(a).aktaIjazahKtp).length;
  const countSuketKesehatan = athletes.filter((a) => getDocChecklist(a).suketKesehatan).length;

  // Filter athletes
  const filteredAthletes = athletes.filter((a) => {
    const doc = getDocChecklist(a);
    const isAllComplete = doc.suratPembebasan && doc.aktaIjazahKtp && doc.suketKesehatan;

    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nik.includes(searchQuery) ||
      a.matchCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiscipline =
      athleteDisciplineFilter === 'ALL' || a.discipline === athleteDisciplineFilter;

    const matchesStatus =
      athleteDocStatusFilter === 'ALL'
        ? true
        : athleteDocStatusFilter === 'Lengkap'
        ? isAllComplete
        : !isAllComplete;

    return matchesSearch && matchesDiscipline && matchesStatus;
  });

  // Filter equipment checklist items
  const equipmentItems = checklists.filter((item) => {
    const matchesCategory = item.category === 'perlengkapan';
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalEquipItems = equipmentItems.length;
  const completedEquipItems = equipmentItems.filter((i) => i.isChecked).length;
  const equipPercent = totalEquipItems > 0 ? Math.round((completedEquipItems / totalEquipItems) * 100) : 0;

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      category: newCategory,
      title: newTitle,
      isChecked: newIsChecked,
      quantity: newQuantity,
      condition: newCondition,
      note: newNote,
    });

    setNewTitle('');
    setNewIsChecked(false);
    setNewQuantity(14);
    setNewCondition('Bagus');
    setNewNote('');
    setIsAddingNew(false);
  };

  const handleUpdateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Checklist Kontingen Wushu</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pendataan verifikasi 3 dokumen wajib per atlet & seluruh perlengkapan PORPROV XVI SUMBAR.
          </p>
        </div>

        {activeCategory === 'perlengkapan' ? (
          <button
            onClick={() => {
              setNewCategory('perlengkapan');
              setIsAddingNew(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-xs font-bold shadow-lg hover:from-red-500 hover:to-red-600 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Item Perlengkapan</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {onSetAllAthletesAllDocs && (
              <button
                onClick={() => onSetAllAthletesAllDocs(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition"
              >
                <Check className="w-4 h-4" />
                <span>Tandai Semua Atlet Lengkap (100%)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main 2 Categories Navigation */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            setActiveCategory('dokumen');
            setSearchQuery('');
          }}
          className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'dokumen'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Dokumen ({athletes.length} Atlet)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('perlengkapan');
            setSearchQuery('');
          }}
          className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'perlengkapan'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Perlengkapan ({equipmentItems.length} Item)</span>
        </button>
      </div>

      {/* DOKUMEN TAB CONTENT: Pendataan 3 Dokumen Per Atlet */}
      {activeCategory === 'dokumen' && (
        <div className="space-y-4">
          {/* Summary Metric Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Status Verifikasi 3 Dokumen Atlet
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {completeAthletes} dari {totalAthletes} Atlet Lengkap ({athleteDocPercent}%)
                </h3>
              </div>

              <div className="w-full sm:w-48 bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${athleteDocPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Document Pillars Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block">1. Surat Pembebasan</span>
                  <span className="text-xs text-slate-300 font-medium">Tanggungan Kontingen</span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {countSuratPembebasan} / {totalAthletes}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block">2. Akta / Ijazah / KTP</span>
                  <span className="text-xs text-slate-300 font-medium">Identitas Resmi Atlet</span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {countAktaIjazah} / {totalAthletes}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block">3. Suket Kesehatan</span>
                  <span className="text-xs text-slate-300 font-medium">Surat Dokter / Medis</span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {countSuketKesehatan} / {totalAthletes}
                </span>
              </div>
            </div>
          </div>

          {/* Athlete Filter & Search Toolbar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atlet, NIK, nomor tanding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={athleteDisciplineFilter}
                onChange={(e) => setAthleteDisciplineFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Cabang (Sanda & Taolu)</option>
                <option value="Sanda">Cabang Sanda</option>
                <option value="Taolu">Cabang Taolu</option>
              </select>

              <select
                value={athleteDocStatusFilter}
                onChange={(e) => setAthleteDocStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Status Berkas</option>
                <option value="Lengkap">Berkas Lengkap (3/3)</option>
                <option value="Belum Lengkap">Belum Lengkap (&lt; 3)</option>
              </select>
            </div>
          </div>

          {/* Athletes Document Checklist Cards */}
          <div className="space-y-3">
            {filteredAthletes.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">Tidak ada atlet ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter cabang.</p>
              </div>
            ) : (
              filteredAthletes.map((athlete, idx) => {
                const doc = getDocChecklist(athlete);
                const completedCount =
                  (doc.suratPembebasan ? 1 : 0) +
                  (doc.aktaIjazahKtp ? 1 : 0) +
                  (doc.suketKesehatan ? 1 : 0);
                const isFullyComplete = completedCount === 3;

                return (
                  <div
                    key={athlete.id}
                    className={`bg-slate-900 border rounded-2xl p-4 transition shadow-md ${
                      isFullyComplete
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-amber-500/40 bg-amber-950/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Athlete Identity */}
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center text-xs font-black shrink-0">
                          {idx + 1}
                        </span>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-white">{athlete.name}</h4>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                                athlete.discipline === 'Sanda'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {athlete.discipline}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: 3 Interactive Document Checkboxes */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* 1. Surat Pembebasan */}
                        <button
                          type="button"
                          onClick={() =>
                            onToggleAthleteDoc &&
                            onToggleAthleteDoc(
                              athlete.id,
                              'suratPembebasan',
                              !doc.suratPembebasan
                            )
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                            doc.suratPembebasan
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                          title="Klik untuk ubah status Surat Pembebasan Tanggungan"
                        >
                          {doc.suratPembebasan ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>1. Surat Pembebasan</span>
                        </button>

                        {/* 2. Akta / Ijazah / KTP */}
                        <button
                          type="button"
                          onClick={() =>
                            onToggleAthleteDoc &&
                            onToggleAthleteDoc(
                              athlete.id,
                              'aktaIjazahKtp',
                              !doc.aktaIjazahKtp
                            )
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                            doc.aktaIjazahKtp
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                          title="Klik untuk ubah status Akta/Ijazah/KTP"
                        >
                          {doc.aktaIjazahKtp ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>2. Akta/Ijazah/KTP</span>
                        </button>

                        {/* 3. Suket Kesehatan */}
                        <button
                          type="button"
                          onClick={() =>
                            onToggleAthleteDoc &&
                            onToggleAthleteDoc(
                              athlete.id,
                              'suketKesehatan',
                              !doc.suketKesehatan
                            )
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                            doc.suketKesehatan
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                          title="Klik untuk ubah status Surat Keterangan Kesehatan"
                        >
                          {doc.suketKesehatan ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>3. Suket Kesehatan</span>
                        </button>

                        {/* Quick toggle complete button */}
                        {onSetAthleteAllDocs && (
                          <button
                            type="button"
                            onClick={() =>
                              onSetAthleteAllDocs(athlete.id, !isFullyComplete)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center gap-1 shrink-0 ${
                              isFullyComplete
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
                            }`}
                          >
                            <span>
                              {isFullyComplete
                                ? '✓ Lengkap (3/3)'
                                : `Belum (${completedCount}/3)`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PERLENGKAPAN TAB CONTENT */}
      {activeCategory === 'perlengkapan' && (
        <div className="space-y-4">
          {/* Progress & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-xs font-bold text-slate-300">
                Progress Perlengkapan:{' '}
                <span className="text-emerald-400 text-sm font-extrabold">{equipPercent}%</span>
              </div>
              <div className="w-36 bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${equipPercent}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                ({completedEquipItems}/{totalEquipItems} Selesai)
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari perlengkapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Checklist Items List */}
          {equipmentItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">Tidak Ada Item Perlengkapan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Klik "+ Tambah Item Perlengkapan" untuk menambahkan perlengkapan baru.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {equipmentItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition gap-3 ${
                    item.isChecked
                      ? 'bg-slate-900/40 border-slate-800/80'
                      : 'bg-slate-900 border-slate-700/80 shadow-md'
                  }`}
                >
                  {/* Left: Checkbox & Title */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={(e) => onToggleItem(item.id, e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500 cursor-pointer shrink-0"
                    />

                    <div>
                      <span
                        className={`text-sm font-bold block ${
                          item.isChecked ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.note && (
                        <p className="text-xs text-amber-400 mt-0.5 italic">
                          Catatan: {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status "Sudah / Belum", Quantity, Condition & Edit */}
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                    <button
                      onClick={() => onToggleItem(item.id, !item.isChecked)}
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-md border flex items-center gap-1 transition ${
                        item.isChecked
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}
                    >
                      {item.isChecked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sudah</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Belum</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      Jumlah: <strong className="text-white">{item.quantity}</strong>
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                        item.condition === 'Bagus'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.condition === 'Perlu Diperbaiki'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {item.condition}
                    </span>

                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-4">
              Tambah Item Perlengkapan Baru
            </h3>

            <form onSubmit={handleAddNewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Perlengkapan / Barang *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="mis. Handwrap Merah 5 Meter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Status Selector: Sudah vs Belum */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Checklist
                </label>
                <select
                  value={newIsChecked ? 'Sudah' : 'Belum'}
                  onChange={(e) => setNewIsChecked(e.target.value === 'Sudah')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="Sudah">🟢 Sudah (Selesai/Lengkap)</option>
                  <option value="Belum">🔴 Belum (Belum Di-check)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah Barang
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kondisi Barang
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="Bagus">🟢 Bagus</option>
                    <option value="Perlu Diperbaiki">🟡 Perlu Diperbaiki</option>
                    <option value="Rusak/Kurang">🔴 Rusak / Kurang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Tambahkan detail atau keterangan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-4">Edit Item Checklist</h3>

            <form onSubmit={handleUpdateItemSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Item</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Status Selector: Sudah vs Belum */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Checklist (Sudah / Belum)
                </label>
                <select
                  value={editingItem.isChecked ? 'Sudah' : 'Belum'}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isChecked: e.target.value === 'Sudah' })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="Sudah">🟢 Sudah (Selesai/Lengkap)</option>
                  <option value="Belum">🔴 Belum (Belum Di-check)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kondisi</label>
                  <select
                    value={editingItem.condition}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, condition: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="Bagus">🟢 Bagus</option>
                    <option value="Perlu Diperbaiki">🟡 Perlu Diperbaiki</option>
                    <option value="Rusak/Kurang">🔴 Rusak / Kurang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editingItem.note || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
