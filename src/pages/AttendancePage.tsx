import React, { useState } from 'react';
import { Student, StudentCurrentState } from '../types/database.types';
import { StatusCard } from '../components/attendance/StatusCard';
import { AttendanceTimeline } from '../components/attendance/AttendanceTimeline';
import { GatePassModal } from '../components/attendance/GatePassModal';
import { useAttendance } from '../hooks/useAttendance';
import { RefreshCw, QrCode, ShieldCheck } from 'lucide-react';

interface AttendancePageProps {
  student: Student | null;
  currentState: StudentCurrentState;
  onOpenIdCard: () => void;
  onOpenScanner?: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  student,
  currentState,
  onOpenIdCard,
}) => {
  const { logs, isLoading, refresh } = useAttendance(student?.id);
  const [isGatePassOpen, setIsGatePassOpen] = useState(false);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se ha seleccionado ningún estudiante.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tarjeta de Estado en Tiempo Real del Alumno */}
      <StatusCard student={student} currentState={currentState} />

      {/* Barra de acción rápida y título */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            Historial de Ingresos y Salidas
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            Registro automatizado por carnet QR en garita
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => refresh()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Actualizar registro"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsGatePassOpen(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs transition-colors"
            title="Generar Pase de Retiro Anticipado"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Pase de Salida</span>
            <span className="sm:hidden">Pase</span>
          </button>

          <button
            onClick={onOpenIdCard}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
            title="Ver Carnet QR"
          >
            <QrCode className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">Carnet QR</span>
          </button>
        </div>
      </div>

      {/* Feed Cronológico */}
      <AttendanceTimeline logs={logs} isLoading={isLoading} />

      {/* Modal de Pase de Salida Anticipada */}
      <GatePassModal
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
        student={student}
      />
    </div>
  );
};
