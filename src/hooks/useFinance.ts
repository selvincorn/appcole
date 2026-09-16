import { useState, useEffect, useCallback, useMemo } from 'react';
import { TuitionFee } from '../types/database.types';
import { api } from '../services/api';

export const useFinance = (studentId?: string) => {
  const [fees, setFees] = useState<TuitionFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    if (!studentId) {
      setFees([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTuitionFees(studentId);
      setFees(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar estado de cuenta');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const stats = useMemo(() => {
    let paidTotal = 0;
    let pendingTotal = 0;
    let lateFeeTotal = 0;
    let overdueCount = 0;

    fees.forEach(f => {
      const amount = Number(f.amount) || 0;
      const late = Number(f.late_fee) || 0;

      if (f.status === 'PAGADO') {
        paidTotal += amount;
      } else {
        pendingTotal += amount;
        lateFeeTotal += late;
        if (f.status === 'VENCIDO') {
          overdueCount++;
        }
      }
    });

    return {
      paidTotal,
      pendingTotal,
      lateFeeTotal,
      grandTotalPending: pendingTotal + lateFeeTotal,
      overdueCount,
      hasDebt: pendingTotal > 0,
    };
  }, [fees]);

  const payFee = async (feeId: string, method: 'TARJETA' | 'TRANSFERENCIA' = 'TARJETA') => {
    const success = await api.payTuitionFee(feeId, method);
    if (success) {
      await fetchFees();
    }
    return success;
  };

  return {
    fees,
    stats,
    isLoading,
    error,
    refresh: fetchFees,
    payFee,
  };
};
