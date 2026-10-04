import React, { useState, useEffect } from 'react';
import { Athlete, Discipline, SandaAthleteDetails, TaoluAthleteDetails } from '../types';
import { X, User, Phone, Scale, Users } from 'lucide-react';

interface AthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (athlete: Athlete) => void;
  initialData?: Athlete | null;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [noKK, setNoKK] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('Sanda');
  const [matchCategory, setMatchCategory] = useState('');
  const [classCategory, setClassCategory] = useState('Senior');
  const [ageCategory, setAgeCategory] = useState('Senior');
  const [weight, setWeight] = useState<number>(56);
  const [targetWeight, setTargetWeight] = useState<number>(56);
  const [height, setHeight] = useState<number>(165);
  const [bloodType, setBloodType] = useState('');
  const [shirtSize, setShirtSize] = useState('L');
  const [shoeSize, setShoeSize] = useState('40');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Parent Info
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');

  const [healthStatus, setHealthStatus] = useState<'Sehat / Fit' | 'Recovery' | 'Cedera Ringan' | 'Perlu Perhatian'>('Sehat / Fit');
  const [docStatus, setDocStatus] = useState<'Lengkap' | 'Belum Lengkap' | 'Sedang Diproses'>('Lengkap');
  const [notes, setNotes] = useState('');

  // Sanda Details
  const [weightClass, setWeightClass] = useState('56 kg');
  const [weighInSchedule, setWeighInSchedule] = useState('2026-10-06 06:00');

  // Taolu Details
  const [taoluNumber, setTaoluNumber] = useState('Taolu Pa');
  const [weaponType, setWeaponType] = useState('Pedang (Jian)');
  const [weaponReady, setWeaponReady] = useState(true);
  const [musicReady, setMusicReady] = useState(true);
  const [musicTrackName, setMusicTrackName] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNik(initialData.nik);
      setNoKK(initialData.noKK || '');
      setGender(initialData.gender);
      setBirthPlace(initialData.birthPlace || '');
      setBirthDate(initialData.birthDate || '');
      setDiscipline(initialData.discipline);
      setMatchCategory(initialData.matchCategory);
      setClassCategory(initialData.classCategory);
      setAgeCategory(initialData.ageCategory);
      setWeight(initialData.weight);
      setTargetWeight(initialData.targetWeight);
      setHeight(initialData.height || 165);
      setBloodType(initialData.bloodType || '');
      setShirtSize(initialData.shirtSize || 'L');
      setShoeSize(initialData.shoeSize || '40');
      setPhone(initialData.phone);
      setEmail(initialData.email || '');

      setFatherName(initialData.fatherName || '');
      setFatherPhone(initialData.fatherPhone || '');
      setMotherName(initialData.motherName || '');
      setMotherPhone(initialData.motherPhone || '');

      setHealthStatus(initialData.healthStatus);
      setDocStatus(initialData.docStatus);
      setNotes(initialData.notes);

      if (initialData.sandaDetails) {
        setWeightClass(initialData.sandaDetails.weightClass);
        setWeighInSchedule(initialData.sandaDetails.weighInSchedule);
      }

      if (initialData.taoluDetails) {
        setTaoluNumber(initialData.taoluDetails.taoluNumber);
        setWeaponType(initialData.taoluDetails.weaponType);
        setWeaponReady(initialData.taoluDetails.weaponReady);
        setMusicReady(initialData.taoluDetails.musicReady);
        setMusicTrackName(initialData.taoluDetails.musicTrackName || '');
      }
    } else {
      setName('');
      setNik('');
      setNoKK('');
      setGender('Laki-laki');
      setBirthPlace('Padang');
      setBirthDate('');
      setDiscipline('Sanda');
      setMatchCategory('Sanda Pa 56 Kg Junior');
      setClassCategory('Junior Putra');
      setAgeCategory('Junior (16 Th)');
      setWeight(56);
      setTargetWeight(56);
      setHeight(165);
      setBloodType('O');
      setShirtSize('L');
      setShoeSize('40');
      setPhone('');
      setEmail('');
      setFatherName('');
      setFatherPhone('');
      setMotherName('');
      setMotherPhone('');
      setHealthStatus('Sehat / Fit');
      setDocStatus('Lengkap');
      setNotes('');
      setWeightClass('56 kg');
      setWeighInSchedule('2026-10-06 06:00');
      setTaoluNumber('Taolu Pa');
      setWeaponType('Pedang (Jian)');
      setWeaponReady(true);
      setMusicReady(true);
      setMusicTrackName('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let sandaDetails: SandaAthleteDetails | undefined = undefined;
    let taoluDetails: TaoluAthleteDetails | undefined = undefined;

    if (discipline === 'Sanda') {
      const diff = weight - targetWeight;
      let weighInStatus: 'sesuai' | 'mendekati' | 'diatas' = 'sesuai';
      if (diff > 1.5) weighInStatus = 'diatas';
      else if (diff > 0) weighInStatus = 'mendekati';

      sandaDetails = {
        weightClass,
        initialWeight: weight,
        currentWeight: weight,
        targetWeight,
        weighInStatus,
        weighInSchedule,
      };
    } else {
      taoluDetails = {
        taoluNumber,
        weaponType,
        weaponReady,
        musicReady,
        musicTrackName,
      };
    }

    const athlete: Athlete = {
      id: initialData?.id || `atl-${Date.now()}`,
      name,
      nik,
      noKK,
      gender,
      birthPlace,
      birthDate,
      discipline,
      matchCategory,
      classCategory,
      ageCategory,
      weight,
      targetWeight,
      height,
      bloodType,
      shirtSize,
      shoeSize,
      phone,
      email,
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      healthStatus,
      docStatus,
      notes,
      sandaDetails,
      taoluDetails,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(athlete);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-white text-base">
              {initialData ? 'Edit Data Atlet' : 'Tambah Atlet Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Discipline Selection Tabs */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setDiscipline('Sanda');
                setMatchCategory('Sanda Pa 56 Kg Junior');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                discipline === 'Sanda'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🥊 Cabang Sanda (Tarung)
            </button>
            <button
              type="button"
              onClick={() => {
                setDiscipline('Taolu');
                setMatchCategory('Taolu Pa');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                discipline === 'Taolu'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🤸 Cabang Taolu (Seni)
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap Atlet *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Arthur Rasyid Anshari"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIK / Nomor Identitas *
              </label>
              <input
                type="text"
                required
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 digit NIK"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor Kartu Keluarga (KK)
              </label>
              <input
                type="text"
                value={noKK}
                onChange={(e) => setNoKK(e.target.value)}
                placeholder="16 digit KK"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Laki-laki">Laki-laki (L)</option>
                <option value="Perempuan">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Padang"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kelas / Nomor Pertandingan *
              </label>
              <input
                type="text"
                required
                value={matchCategory}
                onChange={(e) => setMatchCategory(e.target.value)}
                placeholder="Sanda Pa 56 Kg Junior / Taolu Pa"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor HP Atlet
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Parent Information Section (Data Orang Tua) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase">
              <Users className="w-4 h-4" />
              <span>Data Orang Tua (Ayah & Ibu)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Ayah
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Nama Ayah..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  No. HP Ayah
                </label>
                <input
                  type="text"
                  value={fatherPhone}
                  onChange={(e) => setFatherPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Ibu
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Nama Ibu..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  No. HP Ibu
                </label>
                <input
                  type="text"
                  value={motherPhone}
                  onChange={(e) => setMotherPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Health & Doc Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Kesehatan
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Sehat / Fit">🟢 Sehat / Fit</option>
                <option value="Recovery">🟡 Recovery Latihan</option>
                <option value="Cedera Ringan">🔴 Cedera Ringan</option>
                <option value="Perlu Perhatian">⚠️ Perlu Perhatian Medis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Dokumen
              </label>
              <select
                value={docStatus}
                onChange={(e) => setDocStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Lengkap">🟢 Lengkap</option>
                <option value="Sedang Diproses">🟡 Sedang Diproses</option>
                <option value="Belum Lengkap">🔴 Belum Lengkap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Atlet
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg shadow-lg transition"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Atlet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
