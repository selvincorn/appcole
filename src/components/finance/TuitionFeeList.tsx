import React, { useState } from 'react';
import { TuitionFee } from '../../types/database.types';
import { Badge } from '../common/Badge';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Calendar, 
  Receipt,
  AlertCircle
} from 'lucide-react';

interface TuitionFeeListProps {
  fees: TuitionFee[];
  isLoading: boolean;
  onPayFee: (feeId: string) => Promise<boolean>;
  onViewReceipt: (fee: TuitionFee) => void;
}

export const TuitionFeeList: React.FC<TuitionFeeListProps> = ({
  fees,
  isLoading,
  onPayFee,
  onViewReceipt,
}) => {
  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null);

  const formatMoney = (val: number) => {
    return `Q${val.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePay = async (fee: TuitionFee) => {
    setProcessingFeeId(fee.id);
    const ok = await onPayFee(fee.id);
    setProcessingFeeId(null);
    if (ok) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse glass-card p-5 rounded-3xl space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-3xl p-6">
        <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Sin colegiaturas asignadas</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Las cuotas del ciclo escolar aparecerán en este panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fees.map((fee) => {
        const isPaid = fee.status === 'PAGADO';
        const isOverdue = fee.status === 'VENCIDO';
        const amount = Number(fee.amount) || 0;
        const late = Number(fee.late_fee) || 0;
        const total = amount + late;

        let badgeVariant: 'emerald' | 'amber' | 'rose' = 'amber';
        if (isPaid) badgeVariant = 'emerald';
        else if (isOverdue) badgeVariant = 'rose';

        return (
          <div
            key={fee.id}
            className={`glass-card p-4 sm:p-5 rounded-3xl transition-all duration-200 hover:-translate-y-0.5 ${
              isOverdue
                ? 'border-rose-300/80 bg-rose-50/20 dark:bg-rose-950/20 dark:border-rose-800/60'
                : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-display font-black text-slate-900 dark:text-white truncate">
                    {fee.concept}
                  </h4>
                  <Badge variant={badgeVariant} size="sm">
                    {fee.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    Vence: {fee.due_date}
                  </span>
                  {isPaid && fee.receipt_number && (
                    <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                      {fee.receipt_number}
                    </span>
                  )}
                </div>

                {late > 0 && !isPaid && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Recargo por mora: +{formatMoney(late)}</span>
                  </p>
                )}
              </div>

              {/* Importe en Quetzales */}
              <div className="text-right">
                <p className="text-lg font-display font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {formatMoney(total)}
                </p>
                {late > 0 && !isPaid && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                    Base: {formatMoney(amount)}
                  </p>
                )}
              </div>
            </div>

            {/* Acciones de la cuota */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              {isPaid ? (
                <button
                  type="button"
                  onClick={() => onViewReceipt(fee)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
                >
                  <Receipt className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Ver Recibo Oficial</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processingFeeId === fee.id}
                  onClick={() => handlePay(fee)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all active:scale-95 group"
                >
                  <CreditCard className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>{processingFeeId === fee.id ? 'Procesando Pago...' : 'Pagar Colegiatura'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
