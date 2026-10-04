import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { FileText, Plus, CheckCircle2, Clock, AlertTriangle, Download, Edit2, Trash2 } from 'lucide-react';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onUpdateDocumentStatus: (id: string, status: 'Lengkap' | 'Sedang Diproses' | 'Belum Lengkap') => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onAddDocument,
  onUpdateDocumentStatus,
  onDeleteDocument,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'KTP' | 'Surat Tugas' | 'Kesehatan' | 'Pendaftaran' | 'Penginapan/Transportasi' | 'Lainnya'>('Surat Tugas');
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState<'Lengkap' | 'Sedang Diproses' | 'Belum Lengkap'>('Lengkap');
  const [notes, setNotes] = useState('');

  const filteredDocs = documents.filter(
    (d) => filterCategory === 'ALL' || d.category === filterCategory
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddDocument({
      id: `doc-${Date.now()}`,
      title,
      category,
      ownerName: ownerName || 'Kontingen',
      status,
      notes,
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    setTitle('');
    setOwnerName('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Dokumen Pertandingan & Administrasi</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Arsip digital Surat Tugas, Kartu Identitas KTP, Bebas Doping, Pendaftaran & Vouchering Akomodasi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-xs font-bold shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumen</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-400">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            filterCategory === 'ALL' ? 'bg-red-600 text-white' : 'hover:text-white'
          }`}
        >
          Semua Dokumen ({documents.length})
        </button>
        {['KTP', 'Surat Tugas', 'Kesehatan', 'Pendaftaran', 'Penginapan/Transportasi'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterCategory === cat ? 'bg-red-600 text-white' : 'hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-slate-950 text-red-400 border border-slate-800 rounded-full uppercase">
                  {doc.category}
                </span>

                <select
                  value={doc.status}
                  onChange={(e) => onUpdateDocumentStatus(doc.id, e.target.value as any)}
                  className={`text-xs font-extrabold px-2 py-1 rounded-lg border focus:outline-none ${
                    doc.status === 'Lengkap'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : doc.status === 'Sedang Diproses'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <option value="Lengkap">🟢 Lengkap</option>
                  <option value="Sedang Diproses">🟡 Diproses</option>
                  <option value="Belum Lengkap">🔴 Belum</option>
                </select>
              </div>

              <h3 className="text-base font-extrabold text-white">{doc.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Pemilik / Instansi: {doc.ownerName}</p>

              {doc.notes && (
                <p className="text-xs text-slate-300 mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 italic">
                  {doc.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-500">
              <span>Update: {doc.updatedAt}</span>

              <button
                onClick={() => onDeleteDocument(doc.id)}
                className="text-slate-400 hover:text-red-400 p-1 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-4">Tambah Dokumen Pertandingan</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Dokumen *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="mis. Surat Kesehatan Bebas Doping"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Surat Tugas">Surat Tugas</option>
                    <option value="KTP">KTP / Identitas</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pendaftaran">Pendaftaran</option>
                    <option value="Penginapan/Transportasi">Penginapan/Transportasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Dokumen</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Lengkap">🟢 Lengkap</option>
                    <option value="Sedang Diproses">🟡 Diproses</option>
                    <option value="Belum Lengkap">🔴 Belum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pemilik / Penanggung Jawab</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama atlet / tim / official"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                />
              </div>

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
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
