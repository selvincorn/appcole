import React, { useState } from 'react';
import { Student } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  GraduationCap, 
  Copy, 
  Check, 
  Phone, 
  ShieldCheck,
  ScanLine,
  Sparkles
} from 'lucide-react';

interface StudentIdCardModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenScannerWithCode?: (code: string) => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  isOpen,
  onClose,
  onOpenScannerWithCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(student.student_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    student.student_code
  )}&margin=1`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        {/* Carnet Físico Escolar con Fondo Sólido de Alto Contraste (Cero texto deslavado) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white p-4 sm:p-6 shadow-2xl border-2 border-indigo-500/40">
          {/* Acentos de luz sutiles sin afectar contraste */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Cabecera del Carnet */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-700/80 relative z-10">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-display font-black tracking-wider uppercase text-white">
                  COLEGIO EL RENUEVO
                </p>
                <p className="text-[9px] sm:text-[10px] text-brand-300 font-bold tracking-wide">
                  Guatemala • Ciclo Escolar 2026
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>Activo</span>
            </span>
          </div>

          {/* Foto e información del alumno (Alto Contraste) */}
          <div className="flex items-center gap-3 sm:gap-4 my-3.5 sm:my-5 relative z-10">
            <div className="relative shrink-0">
              <img
                src={student.photo_url || ''}
                alt={student.first_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-400 shadow-xl ring-2 ring-white/10"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-brand-600 rounded-full text-white shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-display font-black text-white truncate leading-tight drop-shadow-sm">
                {student.first_name} {student.last_name}
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-0.5 sm:mt-1 truncate">
                {student.grade_level} • Sección "{student.section}"
              </p>
              <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-slate-800 text-brand-300 font-mono text-[11px] sm:text-xs font-black border border-slate-700 shadow-xs tracking-wider">
                {student.student_code}
              </div>
            </div>
          </div>

          {/* Contenedor blanco nítido para Código QR y Barras */}
          <div className="qr-container bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-slate-900 shadow-xl relative z-10">
            <div className="p-0.5 sm:p-1 bg-white rounded-xl">
              <img
                src={qrUrl}
                alt={`QR ${student.student_code}`}
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
              />
            </div>

            {/* Código de barras nítido */}
            <div className="w-full pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-200 flex flex-col items-center">
              <div className="flex gap-[2px] h-6 sm:h-7 items-end justify-center w-44 sm:w-52">
                {[2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 4, 1, 2, 5, 3, 1, 2, 4, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 3].map((h, i) => (
                  <span
                    key={i}
                    className="bg-slate-900 w-[2px] sm:w-[2.5px] rounded-full"
                    style={{ height: `${h * 4.5}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] sm:text-xs text-slate-800 font-black tracking-widest mt-1">
                {student.student_code}
              </span>
            </div>
          </div>

          {/* Teléfono de emergencia y Validez */}
          {student.emergency_phone && (
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-300 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-700/80">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Emergencias: {student.emergency_phone}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold shrink-0 ml-1">Validez: Oct 2026</span>
            </div>
          )}
        </div>

        {/* Botones de acción inferior */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
          </button>

          {onOpenScannerWithCode && (
            <button
              onClick={() => {
                onClose();
                onOpenScannerWithCode(student.student_code);
              }}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-brand-500/25"
            >
              <ScanLine className="w-4 h-4" />
              <span>Probar en Garita</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
