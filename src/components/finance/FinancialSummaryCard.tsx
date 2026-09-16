import { CheckCircle2, AlertTriangle, Printer, ShieldCheck, FileCheck } from 'lucide-react';

interface FinancialSummaryCardProps {
  paidTotal: number;
  pendingTotal: number;
  lateFeeTotal: number;
  grandTotalPending: number;
  overdueCount: number;
  onOpenStatement: () => void;
  onOpenSolvencia?: () => void;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  paidTotal,
  lateFeeTotal,
  grandTotalPending,
  overdueCount,
  onOpenStatement,
  onOpenSolvencia,
}) => {
  const formatMoney = (val: number) => {
    return `Q${val.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isSolvent = grandTotalPending === 0;

  return (
    <div className="space-y-3">
      {/* Tarjeta de Saldo Principal Estilo Fintech / Apple Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-7 shadow-card border border-indigo-500/30">
        {/* Luz ambiental difusa */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-brand-300 border border-white/10">
                Estado Financiero 2026
              </span>
              {isSolvent ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Solvente
                </span>
              ) : overdueCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertTriangle className="w-2.5 h-2.5" /> Pago Pendiente
                </span>
              ) : null}
            </div>

            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Total a Pagar
            </p>

            <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-4xl font-display font-black text-white font-mono tracking-tight">
                {formatMoney(grandTotalPending)}
              </span>
            </div>

            {lateFeeTotal > 0 && (
              <p className="text-xs text-rose-300 font-semibold mt-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Incluye {formatMoney(lateFeeTotal)} de mora</span>
              </p>
            )}

            {isSolvent && (
              <p className="text-xs text-emerald-300 font-semibold mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Excelente! Tu estado de cuenta está al día</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {onOpenSolvencia && (
              <button
                onClick={onOpenSolvencia}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-bold border border-emerald-500/40 transition-all active:scale-95 shadow-sm shrink-0 group w-full sm:w-auto"
                title="Ver Constancia Oficial de Solvencia Escolar"
              >
                <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span>Constancia Solvencia</span>
              </button>
            )}

            <button
              onClick={onOpenStatement}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95 shadow-sm shrink-0 group w-full sm:w-auto"
              title="Ver Estado de Cuenta Oficial Imprimible"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-300 group-hover:scale-110 transition-transform" />
              <span>Ver Comprobante</span>
            </button>
          </div>
        </div>

        {/* Sub-métricas con tarjetas de cristal */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-2.5 sm:p-3 rounded-2xl border border-white/10">
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Pagado</p>
            <p className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
              {formatMoney(paidTotal)}
            </p>
          </div>

          <div className="bg-white/5 p-2.5 sm:p-3 rounded-2xl border border-white/10">
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cuotas por Vencer</p>
            <p className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">
              {overdueCount} {overdueCount === 1 ? 'cuota' : 'cuotas'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
