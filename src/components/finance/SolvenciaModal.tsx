import React from 'react';
import { Student } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  Printer, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode,
  Calendar
} from 'lucide-react';

interface SolvenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const SolvenciaModal: React.FC<SolvenciaModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const certNumber = `SOLV-2026-${student.student_code.replace(/[^0-9]/g, '') || '0421'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Constancia de Solvencia Escolar"
      subtitle="Documento Oficial de Paz y Salvo Financiero"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Actions Bar (no se imprime) */}
        <div className="no-print flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Estado: Alumno Solvente para Evaluaciones Bimestrales
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Constancia</span>
          </button>
        </div>

        {/* Printable Area */}
        <div className="printable-area bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-800 space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Departamento de Tesorería y Administración
                </span>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                  Colegio El Renuevo
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Guatemala, C.A. • NIT: 4928172-1 • Tel: +502 2339-4000
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-black rounded-lg">
                {certNumber}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                Fecha: {today}
              </p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">
              CONSTANCIA DE SOLVENCIA ECONÓMICA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ciclo Escolar 2026 • Nivel Primario y Pre-Primario
            </p>
          </div>

          {/* Body Paragraph */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              La Dirección Financiera y de Cobros del <strong>Colegio El Renuevo</strong> hace constar por medio del presente documento que el estudiante:
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alumno(a)</span>
                <span className="text-sm font-black text-slate-900">{student.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Carnet / Código</span>
                <span className="font-mono font-bold text-slate-800">{student.student_code}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grado Asignado</span>
                <span className="font-bold text-slate-800">{student.grade} - Sección "{student.section || 'A'}"</span>
              </div>
            </div>

            <p className="pt-2">
              Se encuentra <strong>COMPLETAMENTE SOLVENTE</strong> en todos los compromisos económicos y cuotas de colegiatura correspondientes al presente período escolar, no existiendo saldo deudor pendiente a la fecha.
            </p>

            <p className="text-xs text-slate-500 italic">
              Se extiende la presente constancia a solicitud de la parte interesada para los usos académicos, presentación de evaluaciones bimestrales o trámites administrativos que estime convenientes.
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-44 border-b border-slate-400 mt-10 mb-1" />
                <p className="font-bold text-slate-800">Lic. Fernando Morales</p>
                <p className="text-[10px] text-slate-500">Administrador General y Tesorería</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center p-1 text-emerald-800 bg-emerald-50/50">
                  <ShieldCheck className="w-7 h-7 text-emerald-600 mb-0.5" />
                  <span className="text-[8px] uppercase font-black tracking-tighter">SOLVENTE</span>
                  <span className="text-[7px]">Colegio El Renuevo</span>
                </div>
              </div>
            </div>

            {/* Validation QR */}
            <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-slate-700" />
                <span>
                  Verificación de Solvencia: <strong>RENUEVO-SOLV-GT-{student.student_code}-2026</strong>
                </span>
              </div>
              <span>Válido por 30 días a partir de su emisión</span>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};
