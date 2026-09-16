import React from 'react';
import { Student, Grade } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  Printer, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface OfficialReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  grades: Grade[];
  period: string; // ej. 'B1'
}

export const OfficialReportCardModal: React.FC<OfficialReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  grades,
  period,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const periodLabels: Record<string, string> = {
    B1: 'Primer Bimestre',
    B2: 'Segundo Bimestre',
    B3: 'Tercer Bimestre',
    B4: 'Cuarto Bimestre',
  };

  const calculatedGrades = grades.map(g => {
    const total = (g.zone_score || 0) + (g.eval_score || 0) + (g.final_exam_score || 0);
    return {
      ...g,
      total,
      passed: total >= 60,
    };
  });

  const totalPoints = calculatedGrades.reduce((sum, g) => sum + g.total, 0);
  const average = calculatedGrades.length > 0 ? Math.round(totalPoints / calculatedGrades.length) : 0;
  const isHonorRoll = average >= 85;
  const allPassed = calculatedGrades.every(g => g.passed);

  const today = new Date().toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Boleta Oficial de Calificaciones"
      subtitle="Ministerio de Educación de Guatemala (MINEDUC)"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Actions Bar (No se imprime) */}
        <div className="no-print flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Formato Oficial Imprimible y Descargable
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>

        {/* Printable Official Document */}
        <div className="printable-area bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-800 space-y-6">
          
          {/* Header Oficial Escolar y MINEDUC */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  República de Guatemala • MINEDUC
                </span>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                  Colegio El Renuevo
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Resolución Ministerial No. 2026-EDU-042 • Código MINEDUC: 01-01-2026-46
                </p>
                <p className="text-[11px] text-slate-500">
                  Boleta de Evaluación Cuantitativa del Rendimiento Escolar
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-900 font-mono text-xs font-black">
                CICLO ESCOLAR 2026
              </div>
              <p className="text-[11px] font-bold text-slate-600 mt-1">
                Período: {periodLabels[period] || period}
              </p>
              <p className="text-[10px] text-slate-400">
                Emisión: {today}
              </p>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estudiante</span>
              <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Código / Carnet</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{student.student_code}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Grado / Nivel</span>
              <span className="font-bold text-slate-800">{student.grade}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sección</span>
              <span className="font-bold text-slate-800">Sección "{student.section || 'A'}"</span>
            </div>
          </div>

          {/* Cuadro de Honor Banner if >= 85 */}
          {isHonorRoll && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">
                    🎖️ Cuadro de Honor Bimestral
                  </p>
                  <p className="text-[11px] text-amber-800">
                    El alumno ha obtenido un promedio sobresaliente de <strong>{average} pts</strong>, haciéndose acreedor al reconocimiento de excelencia.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black font-mono px-2 py-1 rounded-md bg-amber-200 text-amber-900">
                DISTINGUIDO
              </span>
            </div>
          )}

          {/* Table of Grades */}
          <div className="overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-2.5 px-3 uppercase text-[11px]">Área Curricular (CNB)</th>
                  <th className="py-2.5 px-2 text-center uppercase text-[10px]">Zona (40)</th>
                  <th className="py-2.5 px-2 text-center uppercase text-[10px]">Parcial (30)</th>
                  <th className="py-2.5 px-2 text-center uppercase text-[10px]">Examen (30)</th>
                  <th className="py-2.5 px-3 text-center uppercase text-[11px]">Nota Final (100)</th>
                  <th className="py-2.5 px-3 text-center uppercase text-[11px]">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {calculatedGrades.map((g, idx) => (
                  <tr key={g.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {g.subject?.name || 'Materia'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">
                      {g.zone_score ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">
                      {g.eval_score ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">
                      {g.final_exam_score ?? '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-black text-sm text-slate-900">
                      {g.total}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {g.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> Nivelación
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase text-xs text-slate-700">
                    Promedio General del Bimestre:
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-base text-slate-900">
                    {average} pts
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                      allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {allPassed ? 'APROBADO' : 'CON RECUPERACIÓN'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Scale Legend */}
          <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span><strong>Escala de Calificación MINEDUC:</strong> 0 - 59: No Aprobado • 60 - 74: Bueno • 75 - 84: Muy Bueno • 85 - 100: Excelente</span>
            <span className="font-bold">Mínimo para Aprobar: 60 Puntos</span>
          </div>

          {/* Signatures & Seal Block */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-36 border-b border-slate-400 mt-8 mb-1" />
                <p className="font-bold text-slate-800">Prof. Carlos Méndez</p>
                <p className="text-[10px] text-slate-400">Maestro Guía de Grado</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-1 text-slate-400">
                  <ShieldCheck className="w-6 h-6 text-brand-600 mb-0.5" />
                  <span className="text-[8px] uppercase font-black tracking-tighter">Sello Oficial</span>
                  <span className="text-[7px]">Colegio El Renuevo</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-36 border-b border-slate-400 mt-8 mb-1" />
                <p className="font-bold text-slate-800">Licda. Carmen Estrada</p>
                <p className="text-[10px] text-slate-400">Directora General</p>
              </div>
            </div>

            {/* Validation QR Code */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-slate-700" />
                <span>
                  Verificación Digital Auténtica: <strong>MINEDUC-GT-{student.student_code}-{period}-2026</strong>
                </span>
              </div>
              <span>Página 1 de 1 • Sistema Oficial AppCole GT</span>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};
