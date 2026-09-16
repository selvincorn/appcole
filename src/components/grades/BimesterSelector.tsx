import React from 'react';
import { PeriodType } from '../../types/database.types';

interface BimesterSelectorProps {
  selectedPeriod: PeriodType;
  onChangePeriod: (period: PeriodType) => void;
}

export const BimesterSelector: React.FC<BimesterSelectorProps> = ({
  selectedPeriod,
  onChangePeriod,
}) => {
  const periods: Array<{ id: PeriodType; label: string; short: string; status: string }> = [
    { id: 'BIMESTRE_1', label: 'Bimestre 1', short: 'B1', status: 'Cerrado' },
    { id: 'BIMESTRE_2', label: 'Bimestre 2', short: 'B2', status: 'En curso' },
    { id: 'BIMESTRE_3', label: 'Bimestre 3', short: 'B3', status: 'Próximo' },
    { id: 'BIMESTRE_4', label: 'Bimestre 4', short: 'B4', status: 'Próximo' },
  ];

  return (
    <div className="flex gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar border border-transparent dark:border-slate-700/60">
      {periods.map((p) => {
        const isActive = selectedPeriod === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChangePeriod(p.id)}
            className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <div>{p.label}</div>
            <div className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {p.status}
            </div>
          </button>
        );
      })}
    </div>
  );
};
