import React, { useState, useEffect } from 'react';
import { Coach, Official } from '../types';
import { UserCheck, Building, Plus, Phone, Edit2, Trash2, X } from 'lucide-react';

interface CoachesListProps {
  coaches: Coach[];
  officials: Official[];
  onSaveCoach: (coach: Coach) => void;
  onDeleteCoach: (id: string) => void;
  onSaveOfficial: (official: Official) => void;
  onDeleteOfficial: (id: string) => void;
  defaultTab?: 'coaches' | 'officials';
}

export const CoachesList: React.FC<CoachesListProps> = ({
  coaches,
  officials,
  onSaveCoach,
  onDeleteCoach,
  onSaveOfficial,
  onDeleteOfficial,
  defaultTab = 'coaches',
}) => {
  const [activeTab, setActiveTab] = useState<'coaches' | 'officials'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);

  // Coach Form State
  const [coachName, setCoachName] = useState('');
  const [coachRole, setCoachRole] = useState<string>('Pelatih Kepala');
  const [coachSpec, setCoachSpec] = useState<'Sanda' | 'Taolu' | 'Umum'>('Sanda');
  const [coachPhone, setCoachPhone] = useState('');

  // Official Form State
  const [officialName, setOfficialName] = useState('');
  const [officialRole, setOfficialRole] = useState<string>('Official');
  const [officialPhone, setOfficialPhone] = useState('');
  const [officialNotes, setOfficialNotes] = useState('');

  const handleOpenCoachModal = (coach?: Coach) => {
    if (coach) {
      setEditingCoach(coach);
      setCoachName(coach.name);
      setCoachRole(coach.roleTitle || 'Pelatih Kepala');
      setCoachSpec(coach.specialization);
      setCoachPhone(coach.phone);
    } else {
      setEditingCoach(null);
      setCoachName('');
      setCoachRole('Pelatih Kepala');
      setCoachSpec('Sanda');
      setCoachPhone('');
    }
    setIsCoachModalOpen(true);
  };

  const handleOpenOfficialModal = (official?: Official) => {
    if (official) {
      setEditingOfficial(official);
      setOfficialName(official.name);
      setOfficialRole(official.roleTitle || 'Official');
      setOfficialPhone(official.phone);
      setOfficialNotes(official.notes || '');
    } else {
      setEditingOfficial(null);
      setOfficialName('');
      setOfficialRole('Official');
      setOfficialPhone('');
      setOfficialNotes('');
    }
    setIsOfficialModalOpen(true);
  };

  const handleSaveCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName.trim()) return;

    onSaveCoach({
      id: editingCoach?.id || `cch-${Date.now()}`,
      name: coachName,
      roleTitle: coachRole,
      specialization: coachSpec,
      phone: coachPhone,
      healthStatus: 'Sehat',
    });
    setIsCoachModalOpen(false);
  };

  const handleSaveOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialName.trim()) return;

    onSaveOfficial({
      id: editingOfficial?.id || `off-${Date.now()}`,
      name: officialName,
      roleTitle: officialRole,
      phone: officialPhone,
      notes: officialNotes,
    });
    setIsOfficialModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {activeTab === 'coaches' ? (
              <UserCheck className="w-6 h-6 text-purple-400" />
            ) : (
              <Building className="w-6 h-6 text-blue-400" />
            )}
            <h2 className="text-xl font-extrabold text-white">
              {activeTab === 'coaches' ? 'Data Pelatih Kontingen' : 'Data Official & Manajemen'}
            </h2>
          </div>
        </div>

        {/* Action Button depending on sub-tab */}
        {activeTab === 'coaches' ? (
          <button
            onClick={() => handleOpenCoachModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelatih Baru</span>
          </button>
        ) : (
          <button
            onClick={() => handleOpenOfficialModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Official Baru</span>
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('coaches')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'coaches'
              ? 'text-red-400 border-b-2 border-red-500 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Tim Pelatih ({coaches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('officials')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'officials'
              ? 'text-blue-400 border-b-2 border-blue-500 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Tim Official & Manajemen ({officials.length})</span>
        </button>
      </div>

      {/* Coaches Tab Content */}
      {activeTab === 'coaches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                    PELATIH {c.specialization.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {c.healthStatus}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mt-1">{c.name}</h3>
                <p className="text-xs font-bold text-red-400">{c.roleTitle}</p>

                <div className="mt-3 text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone || 'Tidak ada HP'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenCoachModal(c)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus pelatih ${c.name}?`)) onDeleteCoach(c.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Officials Tab Content */}
      {activeTab === 'officials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officials.map((o) => (
            <div
              key={o.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    OFFICIAL
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mt-1">{o.name}</h3>
                <p className="text-xs font-bold text-blue-400">{o.roleTitle}</p>

                <div className="mt-3 text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{o.phone || 'Tidak ada HP'}</span>
                  </div>
                  {o.notes && <p className="text-slate-400 pt-1 text-[11px] italic">{o.notes}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenOfficialModal(o)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus official ${o.name}?`)) onDeleteOfficial(o.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coach Form Modal */}
      {isCoachModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCoachModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-white mb-4">
              {editingCoach ? 'Edit Pelatih' : 'Tambah Pelatih Baru'}
            </h3>

            <form onSubmit={handleSaveCoachSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pelatih *</label>
                <input
                  type="text"
                  required
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jabatan / Role *</label>
                <select
                  value={coachRole}
                  onChange={(e) => setCoachRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                >
                  <option value="Pelatih Kepala">Pelatih Kepala</option>
                  <option value="Pelatih Sanda">Pelatih Sanda</option>
                  <option value="Pelatih Taolu">Pelatih Taolu</option>
                  <option value="Asisten Pelatih">Asisten Pelatih</option>
                  <option value="Fisioterapis / Fisik">Fisioterapis / Fisik</option>
                  <option value="Official">Official</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spesialisasi</label>
                <select
                  value={coachSpec}
                  onChange={(e) => setCoachSpec(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                >
                  <option value="Sanda">Sanda</option>
                  <option value="Taolu">Taolu</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor HP</label>
                <input
                  type="text"
                  value={coachPhone}
                  onChange={(e) => setCoachPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCoachModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Simpan Pelatih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Form Modal */}
      {isOfficialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOfficialModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-white mb-4">
              {editingOfficial ? 'Edit Official' : 'Tambah Official Baru'}
            </h3>

            <form onSubmit={handleSaveOfficialSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Official *</label>
                <input
                  type="text"
                  required
                  value={officialName}
                  onChange={(e) => setOfficialName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jabatan / Role *</label>
                <select
                  value={officialRole}
                  onChange={(e) => setOfficialRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                >
                  <option value="Official">Official</option>
                  <option value="Manajer Kontingen">Manajer Kontingen</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Tim Logistik">Tim Logistik</option>
                  <option value="Dokter Tim">Dokter Tim</option>
                  <option value="Dokumentasi & Media">Dokumentasi & Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor HP</label>
                <input
                  type="text"
                  value={officialPhone}
                  onChange={(e) => setOfficialPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={officialNotes}
                  onChange={(e) => setOfficialNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOfficialModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Simpan Official
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
