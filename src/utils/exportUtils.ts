import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppState } from '../types';

export function exportToExcel(state: AppState, reportType: string) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  if (reportType === 'all' || reportType === 'atlet') {
    const athleteData = state.athletes.map((a) => ({
      'ID Atlet': a.id,
      Nama: a.name,
      'L/P': a.gender === 'Laki-laki' ? 'L' : 'P',
      'Tempat Lahir': a.birthPlace || '-',
      'Tanggal Lahir': a.birthDate || '-',
      'Kelas / Nomor Pertandingan': a.matchCategory,
      'Ukuran Baju': a.shirtSize || '-',
      'Ukuran Sepatu': a.shoeSize || '-',
      NIK: a.nik,
      KK: a.noKK || '-',
      'TB (cm)': a.height || '-',
      'BB (kg)': a.weight || '-',
      'Gol. Darah': a.bloodType || '-',
      Email: a.email || '-',
      HP: a.phone || '-',
      'Nama Ayah': a.fatherName || '-',
      'HP Ayah': a.fatherPhone || '-',
      'Nama Ibu': a.motherName || '-',
      'HP Ibu': a.motherPhone || '-',
      'Status Kesehatan': a.healthStatus,
      'Status Dokumen': a.docStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(athleteData);
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Atlet & Orang Tua');
  }

  if (reportType === 'all' || reportType === 'sanda_weigh_in') {
    const weighLogs = state.weighInLogs.map((w) => ({
      Tanggal: w.date,
      Jam: w.time,
      'Nama Atlet': w.athleteName,
      Kelas: w.weightClass,
      'Berat (kg)': w.weight,
      'Target (kg)': w.targetWeight,
      Status: w.status.toUpperCase(),
      Catatan: w.notes || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(weighLogs);
    XLSX.utils.book_append_sheet(wb, ws, 'Timbang Badan Sanda');
  }

  if (reportType === 'all' || reportType === 'jadwal') {
    const matchData = state.matches.map((m) => ({
      'Partai / Tampil': m.matchNumber,
      'Nama Atlet': m.athleteName,
      Cabang: m.discipline,
      Kategori: m.matchCategory,
      Tanggal: m.date,
      Jam: m.time,
      Venue: m.venue,
      Status: m.status,
      Detail: m.discipline === 'Sanda' 
        ? `Lawan: ${m.sandaExtra?.opponent || '-'} (${m.sandaExtra?.round || '-'})`
        : `Taolu: ${m.taoluExtra?.taoluNumber || '-'}, Senjata: ${m.taoluExtra?.weapon || '-'}`,
    }));
    const ws = XLSX.utils.json_to_sheet(matchData);
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Pertandingan');
  }

  if (reportType === 'all' || reportType === 'pelatih') {
    const coachData = state.coaches.map((c) => ({
      Nama: c.name,
      Jabatan: c.roleTitle,
      Spesialisasi: c.specialization,
      'No HP': c.phone,
      Status: c.healthStatus,
      Catatan: c.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(coachData);
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Pelatih');
  }

  if (reportType === 'all' || reportType === 'official') {
    const officialData = state.officials.map((o) => ({
      Nama: o.name,
      Jabatan: o.roleTitle,
      Seksi: o.section,
      'No HP': o.phone,
      Catatan: o.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(officialData);
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Official');
  }

  if (reportType === 'all' || reportType === 'checklist') {
    const checklistData = state.checklists.map((c) => ({
      Kategori: c.category.toUpperCase(),
      Item: c.title,
      Jumlah: c.quantity,
      Kondisi: c.condition,
      Status: c.isChecked ? 'SELESAI / LENGKAP' : 'BELUM',
      Catatan: c.note || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(checklistData);
    XLSX.utils.book_append_sheet(wb, ws, 'Checklist Perlengkapan');
  }

  XLSX.writeFile(wb, `Laporan_Wushu_Porprov_XVI_Sumbar_${reportType}_${dateStr}.xlsx`);
}

export function exportToPDF(state: AppState, reportTitle: string, tableHeaders: string[], tableData: (string | number)[][]) {
  const doc = new jsPDF('landscape');
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 32, 'F');

  doc.setTextColor(239, 68, 68); // Red
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('WUSHU PORPROV XVI SUMBAR', 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(state.settings.contingentName, 14, 22);
  doc.text(`Dicetak: ${dateStr}`, 220, 22);

  // Subtitle
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(reportTitle.toUpperCase(), 14, 42);

  autoTable(doc, {
    startY: 48,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [185, 28, 28], // red-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 48, left: 14, right: 14 },
  });

  doc.save(`${reportTitle.replace(/ /g, '_')}_PorprovXVISumbar.pdf`);
}
