import React from 'react';
import { GateScannerView } from '../components/scanner/GateScannerView';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Student } from '../types/database.types';

interface ScannerGatePageProps {
  initialCode?: string;
  onBack?: () => void;
  onScanComplete?: (student: Student) => void;
}

export const ScannerGatePage: React.FC<ScannerGatePageProps> = ({
  initialCode,
  onBack,
  onScanComplete,
}) => {
  return (
    <div className="space-y-4">
      {/* Cabecera del Módulo de Garita */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Control de Garita & Accesos</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escaneo óptico de carnet QR / Código de barras para entrada y salida
            </p>
          </div>
        </div>
      </div>

      {/* Componente Escáner */}
      <GateScannerView
        initialCode={initialCode}
        onScanComplete={onScanComplete}
      />
    </div>
  );
};
