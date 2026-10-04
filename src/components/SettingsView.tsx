import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Settings, Save, RefreshCw, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [matchDate, setMatchDate] = useState(settings.matchDate.slice(0, 16));
  const [contingentName, setContingentName] = useState(settings.contingentName);
  const [venueLocation, setVenueLocation] = useState(settings.venueLocation);
  const [emergencyContact, setEmergencyContact] = useState(settings.emergencyContact);
  const [faviconUrl, setFaviconUrl] = useState(
    settings.faviconUrl || '/wushu_logo.svg'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File Upload Handler (Mobile Gallery / PC Upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setFaviconUrl(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      matchDate,
      contingentName,
      venueLocation,
      emergencyContact,
      faviconUrl,
    });

    // Also update index.html favicon dynamically
    const faviconLink = document.getElementById('app-favicon') as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = faviconUrl;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-extrabold text-white">Pengaturan Sistem Kontingen</h2>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Kontingen
            </label>
            <input
              type="text"
              required
              value={contingentName}
              onChange={(e) => setContingentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Favicon & Logo Upload Settings */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Favicon & Logo Kontingen (Upload dari Galeri HP / PC)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shrink-0 shadow">
                <img
                  src={faviconUrl}
                  alt="Favicon Preview"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/wushu_logo.svg';
                  }}
                />
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex gap-2">
                  <label
                    htmlFor="favicon-upload"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs rounded-lg shadow cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto dari Galeri HP / PC</span>
                  </label>
                  <input
                    id="favicon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <input
                  type="text"
                  value={faviconUrl.startsWith('data:') ? 'Base64 Gambar Terunggah' : faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="atau masukkan URL Gambar: https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Anda dapat memilih foto logo dari Galeri HP/PC atau memasukkan link URL gambar secara langsung.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tanggal & Jam Pertandingan PORPROV XVI SUMBAR (Target Countdown)
            </label>
            <input
              type="datetime-local"
              required
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lokasi GOR / Venue
            </label>
            <input
              type="text"
              required
              value={venueLocation}
              onChange={(e) => setVenueLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kontak Darurat Tim / Panitia
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-bold">✓ Pengaturan & Favicon berhasil disimpan!</span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reset Data Box */}
      <div className="bg-slate-900 border border-red-900/40 rounded-2xl p-6 shadow-xl max-w-2xl">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Reset Sample Data Database</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Gunakan tombol di bawah jika ingin mengembalikan seluruh data atlet, pelatih, official, dan checklist ke data awal contoh Padang Pariaman.
        </p>

        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin me-reset seluruh database ke data awal contoh?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-950 text-red-400 border border-red-800/40 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Ke Data Contoh Awal</span>
        </button>
      </div>
    </div>
  );
};
