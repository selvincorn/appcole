import React, { useState } from 'react';
import { Student, TuitionFee } from '../types/database.types';
import { useFinance } from '../hooks/useFinance';
import { FinancialSummaryCard } from '../components/finance/FinancialSummaryCard';
import { TuitionFeeList } from '../components/finance/TuitionFeeList';
import { ReceiptModal } from '../components/finance/ReceiptModal';
import { SolvenciaModal } from '../components/finance/SolvenciaModal';
import { RefreshCw } from 'lucide-react';

interface FinancePageProps {
  student: Student | null;
}

export const FinancePage: React.FC<FinancePageProps> = ({ student }) => {
  const { fees, stats, isLoading, payFee, refresh } = useFinance(student?.id);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSolvenciaOpen, setIsSolvenciaOpen] = useState(false);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<TuitionFee | null>(null);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se ha seleccionado ningún estudiante.
      </div>
    );
  }

  const handleOpenFullStatement = () => {
    setSelectedFeeForReceipt(null);
    setIsReceiptOpen(true);
  };

  const handleOpenSingleFeeReceipt = (fee: TuitionFee) => {
    setSelectedFeeForReceipt(fee);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Resumen Financiero en Quetzales */}
      <FinancialSummaryCard
        paidTotal={stats.paidTotal}
        pendingTotal={stats.pendingTotal}
        lateFeeTotal={stats.lateFeeTotal}
        grandTotalPending={stats.grandTotalPending}
        overdueCount={stats.overdueCount}
        onOpenStatement={handleOpenFullStatement}
        onOpenSolvencia={() => setIsSolvenciaOpen(true)}
      />

      {/* Lista de Cuotas y Mensualidades */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Plan de Pagos y Colegiaturas 2026
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Colegiaturas en Quetzales (Q), matrículas y talleres
            </p>
          </div>

          <button
            onClick={() => refresh()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Actualizar estados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>

        <TuitionFeeList
          fees={fees}
          isLoading={isLoading}
          onPayFee={payFee}
          onViewReceipt={handleOpenSingleFeeReceipt}
        />
      </div>

      {/* Modal de Comprobante / Estado de Cuenta Imprimible */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        student={student}
        fees={fees}
        singleFee={selectedFeeForReceipt}
      />

      {/* Modal de Constancia Oficial de Solvencia Escolar */}
      <SolvenciaModal
        isOpen={isSolvenciaOpen}
        onClose={() => setIsSolvenciaOpen(false)}
        student={student}
      />
    </div>
  );
};
