import { useState, useEffect, useCallback, useMemo } from 'react';
import { Grade, PeriodType } from '../types/database.types';
import { api } from '../services/api';

export const useGrades = (studentId?: string) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('BIMESTRE_1');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!studentId) {
      setGrades([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getGrades(studentId, selectedPeriod);
      setGrades(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar calificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, selectedPeriod]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Métricas calculadas
  const stats = useMemo(() => {
    if (grades.length === 0) {
      return { average: 0, passedCount: 0, failedCount: 0, highestGrade: 0 };
    }
    const sum = grades.reduce((acc, g) => acc + (Number(g.total_score) || 0), 0);
    const avg = Number((sum / grades.length).toFixed(1));
    const passed = grades.filter(g => Number(g.total_score) >= 60).length;
    const failed = grades.length - passed;
    const max = Math.max(...grades.map(g => Number(g.total_score) || 0));

    return {
      average: avg,
      passedCount: passed,
      failedCount: failed,
      highestGrade: max,
    };
  }, [grades]);

  return {
    grades,
    selectedPeriod,
    setSelectedPeriod,
    isLoading,
    error,
    stats,
    refresh: fetchGrades,
  };
};
