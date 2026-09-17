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
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = async () => {
    await refresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2000);
  };

  if (!student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
        No se ha seleccionado ningún estudiante.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. Tarjeta Principal de Estado en Tiempo Real */}
      <StatusCard 
        student={student} 
        currentState={currentState} 
        onOpenIdCard={onOpenIdCard}
        onOpenGatePass={() => setIsGatePassOpen(true)}
      />

      {/* 2. Barra de Título y Acciones del Historial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
            Historial de Movimientos en Garita
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro automático por escaneo de carnet escolar oficial
          </p>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 shadow-xs flex items-center gap-1 text-xs font-bold"
            title="Sincronizar y actualizar registros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            {justRefreshed && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                Al día
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsGatePassOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800/80 shadow-xs transition-all active:scale-95"
            title="Generar Pase de Retiro Anticipado"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pase de Salida</span>
          </button>

          <button
            type="button"
            onClick={onOpenIdCard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Ver Carnet Escolar QR"
          >
            <QrCode className="w-4 h-4 text-brand-400 dark:text-white" />
            <span>Carnet QR</span>
          </button>
        </div>
      </div>

      {/* 3. Línea de Tiempo con Filtros Interactivos */}
      <AttendanceTimeline logs={logs} isLoading={isLoading} />

      {/* 4. Modal de Pase de Salida / Autorización Electrónica */}
      <GatePassModal
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
        student={student}
      />
    </div>
  );
};
