import { useState, useEffect, useCallback } from 'react';
import { AttendanceLog, AttendanceEventType, AttendanceStatus, Student } from '../types/database.types';
import { api } from '../services/api';

export const useAttendance = (studentId?: string) => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!studentId) {
      setLogs([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAttendanceLogs(studentId);
      setLogs(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar asistencias');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Registro de escaneo rápido para Garita
  const recordScan = async (params: {
    studentCode: string;
    eventType: AttendanceEventType;
    status?: AttendanceStatus;
    notes?: string;
    scannedBy?: string;
  }): Promise<{ success: boolean; student?: Student; log?: AttendanceLog; error?: string }> => {
    try {
      const result = await api.recordAttendanceScan(params);
      if (result.success && result.student && result.student.id === studentId) {
        fetchLogs();
      }
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Error registrando escaneo' };
    }
  };

  return {
    logs,
    isLoading,
    error,
    refresh: fetchLogs,
    recordScan,
  };
};
