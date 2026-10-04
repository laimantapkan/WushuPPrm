export type Discipline = 'Sanda' | 'Taolu';

export type UserRole = 'admin' | 'pelatih' | 'official' | 'atlet';

export type ConditionStatus = 'Bagus' | 'Perlu Diperbaiki' | 'Rusak/Kurang';

export type WeighInStatus = 'sesuai' | 'mendekati' | 'diatas';

export type MatchStatus = 'Belum bertanding' | 'Persiapan' | 'Sedang bertanding' | 'Selesai';

export type DailyNoteCategory = 'Pertandingan' | 'Kondisi Atlet' | 'Evaluasi' | 'Cedera' | 'Jadwal' | 'Lainnya';

export interface SandaAthleteDetails {
  weightClass: string; // e.g. "56 kg", "60 kg"
  initialWeight: number; // in kg
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  weighInStatus: WeighInStatus;
  weighInSchedule: string; // e.g. "2026-10-06 06:00"
}

export interface TaoluAthleteDetails {
  taoluNumber: string; // e.g. "Changquan", "Jianshu", "Nanquan"
  weaponType: string; // e.g. "Pedang (Jian)", "Golok (Dao)", "Tangan Kosong"
  weaponReady: boolean;
  musicReady: boolean;
  musicTrackName?: string;
}

export interface AthleteDocChecklist {
  suratPembebasan: boolean; // 1. Surat Pembebasan Kewajiban Tanggungan
  aktaIjazahKtp: boolean;   // 2. Akta / Ijazah / KTP
  suketKesehatan: boolean;  // 3. Surat Keterangan Kesehatan (Suket Kesehatan)
  notes?: string;
}

export interface Athlete {
  id: string;
  name: string;
  nik: string;
  noKK?: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace?: string;
  birthDate?: string;
  discipline: Discipline;
  matchCategory: string; // e.g. "Sanda Pa 56 Kg Junior" or "Taolu Pa"
  classCategory: string; // e.g. "Junior" / "Senior"
  ageCategory: string; // e.g. "Junior (14-16 th)" / "Senior"
  weight: number; // current weight (BB)
  targetWeight: number;
  height?: number; // TB in cm
  bloodType?: string; // Golongan Darah
  phone: string;
  email?: string;
  shirtSize?: string;
  shoeSize?: string;
  // Parent Data
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  healthStatus: 'Sehat / Fit' | 'Recovery' | 'Cedera Ringan' | 'Perlu Perhatian';
  docStatus: 'Lengkap' | 'Belum Lengkap' | 'Sedang Diproses';
  docChecklist?: AthleteDocChecklist;
  notes: string;
  photoUrl?: string;
  sandaDetails?: SandaAthleteDetails;
  taoluDetails?: TaoluAthleteDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Coach {
  id: string;
  name: string;
  roleTitle: string; // e.g. 'Pelatih Kepala', 'Pelatih Sanda', 'Pelatih Taolu', 'Asisten Pelatih', 'Fisioterapis / Fisik', 'Official'
  specialization: 'Sanda' | 'Taolu' | 'Umum';
  phone: string;
  healthStatus: string;
  notes?: string;
  photoUrl?: string;
}

export interface Official {
  id: string;
  name: string;
  roleTitle: string; // e.g. 'Official', 'Manajer Kontingen', 'Sekretaris', 'Bendahara', 'Tim Logistik', 'Dokter Tim', 'Dokumentasi & Media'
  section?: string;
  phone: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  category: 'dokumen' | 'perlengkapan' | string;
  title: string;
  isChecked: boolean;
  quantity: number;
  condition: ConditionStatus;
  note?: string;
  targetId?: string; // e.g. athleteId or coachId if assigned to specific individual
  updatedAt: string;
}

export interface WeighInLog {
  id: string;
  athleteId: string;
  athleteName: string;
  weightClass: string;
  date: string;
  time: string;
  weight: number; // in kg
  targetWeight: number; // in kg
  status: WeighInStatus;
  notes?: string;
}

export interface MatchSchedule {
  id: string;
  athleteId: string;
  athleteName: string;
  discipline: Discipline;
  matchCategory: string; // e.g., "Sanda Pa 56 Kg Junior"
  matchNumber: string; // e.g., "PARTAI-04" or "PERFORMA-02"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string; // e.g. "Sport Hall Atas Ngarai Bukittinggi"
  status: MatchStatus;
  notes?: string;
  sandaExtra?: {
    weighInTime: string;
    weighInResult: string;
    opponent: string;
    round: string; // e.g. "Babak Penyisihan", "Perempat Final", "Final"
  };
  taoluExtra?: {
    taoluNumber: string;
    orderIndex: number;
    weapon: string;
    score?: number;
  };
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'KTP' | 'Surat Tugas' | 'Kesehatan' | 'Pendaftaran' | 'Penginapan/Transportasi' | 'Lainnya';
  ownerName: string;
  status: 'Lengkap' | 'Sedang Diproses' | 'Belum Lengkap';
  fileUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  category: DailyNoteCategory;
  athleteId?: string;
  athleteName?: string;
  content: string;
  followUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppSettings {
  matchDate: string; // e.g. "2026-10-06T07:00"
  contingentName: string; // e.g. "Kontingen Wushu Kab. Padang Pariaman"
  venueLocation: string; // e.g. "Sport Hall Atas Ngarai Bukittinggi"
  emergencyContact: string; // e.g. "+62 812-9876-5432 (Manajer Kontingen)"
  faviconUrl?: string; // Custom Favicon & Logo URL or Base64 Data URL
}

export interface AppState {
  athletes: Athlete[];
  coaches: Coach[];
  officials: Official[];
  checklists: ChecklistItem[];
  weighInLogs: WeighInLog[];
  matches: MatchSchedule[];
  documents: DocumentItem[];
  dailyNotes: DailyNote[];
  notifications: AppNotification[];
  settings: AppSettings;
  lastUpdated: string;
}
