import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { useStudents } from './hooks/useStudents';
import { Header } from './components/layout/Header';
import { BottomNav, ActiveTab } from './components/layout/BottomNav';
import { AttendancePage } from './pages/AttendancePage';
import { GradesPage } from './pages/GradesPage';
import { TeacherGradebookPage } from './pages/TeacherGradebookPage';
import { FinancePage } from './pages/FinancePage';
import { ScannerGatePage } from './pages/ScannerGatePage';
import { AgendaPage } from './pages/AgendaPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { StudentIdCardModal } from './components/attendance/StudentIdCardModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { Student } from './types/database.types';

const MainApp: React.FC = () => {
  const { user, role } = useAuth();
  const { 
    students, 
    selectedStudent, 
    setSelectedStudent, 
    currentState, 
    refreshStudentState 
  } = useStudents();

  // Tab inicial según rol
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (role === 'TEACHER') return 'grades';
    if (role === 'STAFF') return 'scanner';
    return 'attendance';
  });

  // Ajustar tab automáticamente al cambiar de rol
  useEffect(() => {
    if (role === 'TEACHER') {
      setActiveTab('grades');
    } else if (role === 'STAFF') {
      setActiveTab('scanner');
    } else {
      setActiveTab('attendance');
    }
  }, [role]);

  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [prefilledScanCode, setPrefilledScanCode] = useState<string>('');

  // Si no hay usuario logueado
  if (!user) {
    return <LoginPage />;
  }

  // Manejar escaneo completado desde Garita
  const handleScanComplete = (scannedStudent: Student) => {
    refreshStudentState();
    // Si el alumno escaneado coincide con uno de los hijos, seleccionarlo automáticamente
    const matched = students.find(s => s.id === scannedStudent.id);
    if (matched) {
      setSelectedStudent(matched);
    }
  };

  const handleOpenScannerWithCode = (code: string) => {
    setPrefilledScanCode(code);
    setActiveTab('scanner');
  };

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col font-sans pb-44 sm:pb-36 selection:bg-brand-500 selection:text-white">
      {/* Fondo de Malla Ambiental Animado (Ambient Glow) */}
      <div className="bg-mesh">
        <div className="bg-mesh-blob-1" />
        <div className="bg-mesh-blob-2" />
        <div className="bg-mesh-blob-3" />
      </div>

      {/* Cabecera superior con selector de hijos */}
      <div className="relative z-10">
        <Header
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          onOpenIdCard={() => setIsIdCardOpen(true)}
          onOpenScanner={() => setActiveTab('scanner')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Contenedor central responsivo */}
        <main className="max-w-4xl w-full mx-auto px-3 sm:px-6 pt-2 pb-6">
          {activeTab === 'attendance' && (
            <AttendancePage
              student={selectedStudent}
              currentState={currentState}
              onOpenIdCard={() => setIsIdCardOpen(true)}
              onOpenScanner={() => setActiveTab('scanner')}
            />
          )}

          {activeTab === 'grades' && (
            role === 'TEACHER' ? (
              <TeacherGradebookPage />
            ) : (
              <GradesPage student={selectedStudent} />
            )
          )}

          {activeTab === 'agenda' && (
            <AgendaPage student={selectedStudent} />
          )}

          {activeTab === 'finance' && (
            <FinancePage student={selectedStudent} />
          )}

          {activeTab === 'scanner' && (
            <ScannerGatePage
              initialCode={prefilledScanCode}
              onScanComplete={handleScanComplete}
              onBack={() => setActiveTab('attendance')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Barra de Navegación Móvil Inferior Flotante */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal de Carnet Escolar con Código QR y Código de Barras */}
      <StudentIdCardModal
        student={selectedStudent}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        onOpenScannerWithCode={handleOpenScannerWithCode}
      />

      {/* Drawer de Notificaciones Escolares en Tiempo Real */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        selectedStudent={selectedStudent}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
