import React, { useState, useEffect } from 'react';
import { Quote, CheckCircle2, AlertCircle, FileText, Upload, User, LogOut } from 'lucide-react';
import { saveStudentSession, saveAttendanceRecord, getAttendanceRecords, clearStudentSession } from '../utils/storage';

const QUOTES = [
  "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia.",
  "Mencapai kesuksesan dimulai dari kedisiplinan kecil setiap hari.",
  "Masa depan adalah milik mereka yang menyiapkan hari ini.",
  "Hiduplah seolah engkau mati besok. Belajarlah seolah engkau hidup selamanya.",
  "Kesempatan untuk belajar tidak pernah habis, manfaatkanlah setiap detiknya."
];

const CLASSES = [
  ...Array.from({ length: 4 }, (_, i) => `X-${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `XI-${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `XII-${i + 1}`)
];

export default function StudentView({ student, setStudent }) {
  const [quote, setQuote] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [classInput, setClassInput] = useState(CLASSES[0]);

  // Form Absensi State
  const [status, setStatus] = useState('Hadir');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);

  useEffect(() => {
    // Pick dynamic quote on page mount
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);

    // Cek apakah siswa sudah absensi hari ini
    if (student) {
      const records = getAttendanceRecords();
      const today = new Date().toLocaleDateString('id-ID');
      const exists = records.some(
        r => r.studentName === student.name && r.classGrade === student.classGrade && r.date === today
      );
      setSubmittedToday(exists);
    }
  }, [student]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const profile = { name: nameInput.trim(), classGrade: classInput };
    saveStudentSession(profile);
    setStudent(profile);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    if ((status === 'Izin' || status === 'Sakit') && !notes.trim()) {
      alert('Wajib menyertakan keterangan untuk Izin atau Sakit!');
      return;
    }

    const now = new Date();
    const record = {
      id: Date.now().toString(),
      studentName: student.name,
      classGrade: student.classGrade,
      date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status,
      notes: notes.trim() || '-',
      attachmentName: fileName || null
    };

    saveAttendanceRecord(record);
    setSubmittedToday(true);
  };

  const handleResetProfile = () => {
    if (confirm("Reset identitas siswa di perangkat ini?")) {
      clearStudentSession();
      setStudent(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header Info & Dynamic Quote */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
              Sistem Absensi Online
            </span>

            <h2 className="text-xl sm:text-2xl font-bold mt-2">
              {student ? "Halo, " + student.name + "!" : "Selamat Datang, Siswa!"}
            </h2>
            {student && <p className="text-xs text-slate-300 mt-0.5">Kelas Terdaftar: <strong className="text-white">{student.classGrade}</strong></p>}
          </div>

          {student && (
            <button 
              onClick={handleResetProfile} 
              title="Reset Profil Perangkat"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Ganti Akun</span>
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-start gap-3">
          <Quote className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-300 italic font-light">
            "{quote}"
          </p>
        </div>
      </div>

      {/* Persistent Storage Form First Time User */}
      {!student ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-lg">Pendaftaran Perangkat Siswa</h3>
            <p className="text-xs text-slate-500">Isi data sekali, identitas akan tersimpan otomatis di perangkat ini.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap Siswa</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Kelas</label>
              <select
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              Simpan & Lanjutkan
            </button>
          </form>
        </div>
      ) : (
        /* Form Presensi Siswa */
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {submittedToday ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Absensi Hari Ini Terekam</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Terima kasih, data kehadiran Anda sudah masuk ke sistem pemantauan sekolah.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAttendanceSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Form Kehadiran Harian</h3>
                <p className="text-xs text-slate-500">
                  Waktu presensi diambil otomatis sesuai jam smartphone Anda.
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Status Kehadiran</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Hadir', 'Izin', 'Sakit'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2.5 rounded-xl font-medium text-xs sm:text-sm border transition-all ${
                        status === st
                          ? 'bg-sky-50 border-sky-500 text-sky-600 ring-2 ring-sky-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Input for Izin/Sakit */}
              {status !== 'Hadir' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterangan {status} <span className="text-rose-500">* Wajib</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={`Jelaskan alasan ${status.toLowerCase()}...`}
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Surat Keterangan / Bukti (Opsional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-lg p-4 text-center cursor-pointer relative bg-slate-50">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">
                        {fileName ? <span className="text-sky-600 font-medium">{fileName}</span> : "Klik atau seret file (JPG, PNG, PDF)"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
              >
                Kirim Absensi SEKARANG
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}