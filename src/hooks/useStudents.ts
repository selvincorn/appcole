import { useState, useEffect, useCallback } from 'react';
import { Student, StudentCurrentState } from '../types/database.types';
import { api } from '../services/api';
import { useAuth } from './useAuth';

export const useStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentState, setCurrentState] = useState<StudentCurrentState>({
    isInside: false,
    statusLabel: 'Sin registros hoy',
    badgeColor: 'slate',
  });

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudentsForParent(user?.id);
      setStudents(data);
      if (data.length > 0) {
        // Mantener el seleccionado o elegir el primero
        setSelectedStudent(prev => {
          if (prev && data.some(s => s.id === prev.id)) {
            return prev;
          }
          return data[0];
        });
      }
    } catch (e) {
      console.error('Error loading students', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Calcular el estado en tiempo real del estudiante seleccionado (En colegio / Fuera)
  const refreshStudentState = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      const logs = await api.getAttendanceLogs(selectedStudent.id);
      if (logs.length === 0) {
        setCurrentState({
          isInside: false,
          statusLabel: 'Sin registros hoy',
          badgeColor: 'slate',
        });
        return;
      }

      const lastLog = logs[0];
      const isInside = lastLog.event_type === 'IN';

      if (isInside) {
        if (lastLog.status === 'LATE') {
          setCurrentState({
            isInside: true,
            lastEventTime: lastLog.event_time,
            lastEventType: 'IN',
            statusLabel: 'Retraso de ingreso',
            badgeColor: 'amber',
          });
        } else {
          setCurrentState({
            isInside: true,
            lastEventTime: lastLog.event_time,
            lastEventType: 'IN',
            statusLabel: 'En colegio',
            badgeColor: 'emerald',
          });
        }
      } else {
        setCurrentState({
          isInside: false,
          lastEventTime: lastLog.event_time,
          lastEventType: 'OUT',
          statusLabel: 'Fuera del colegio',
          badgeColor: 'slate',
        });
      }
    } catch (e) {
      console.error('Error computing student state', e);
    }
  }, [selectedStudent]);

  useEffect(() => {
    refreshStudentState();
  }, [refreshStudentState]);

  return {
    students,
    selectedStudent,
    setSelectedStudent,
    isLoading,
    currentState,
    refreshStudentState,
    reloadStudents: loadStudents,
  };
};
