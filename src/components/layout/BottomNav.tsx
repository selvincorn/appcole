import React from 'react';
import { 
  Clock, 
  GraduationCap, 
  CreditCard, 
  ScanLine, 
  Settings,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type ActiveTab = 'attendance' | 'grades' | 'agenda' | 'finance' | 'scanner' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { role } = useAuth();

  // Elementos de navegación adaptados por rol
  let navItems = [
    {
      id: 'attendance' as ActiveTab,
      label: 'Asistencia',
      icon: Clock,
      highlight: false,
    },
    {
      id: 'grades' as ActiveTab,
      label: 'Notas',
      icon: GraduationCap,
      highlight: false,
    },
    {
      id: 'agenda' as ActiveTab,
      label: 'Agenda',
      icon: Calendar,
      highlight: false,
    },
    {
      id: 'finance' as ActiveTab,
      label: 'Finanzas',
      icon: CreditCard,
      highlight: false,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Ajustes',
      icon: Settings,
      highlight: false,
    },
  ];

  if (role === 'TEACHER') {
    navItems = [
      {
        id: 'grades' as ActiveTab,
        label: 'Planilla',
        icon: BookOpen,
        highlight: true,
      },
      {
        id: 'agenda' as ActiveTab,
        label: 'Tareas',
        icon: Calendar,
        highlight: false,
      },
      {
        id: 'attendance' as ActiveTab,
        label: 'Asistencia',
        icon: Clock,
        highlight: false,
      },
      {
        id: 'settings' as ActiveTab,
        label: 'Ajustes',
        icon: Settings,
        highlight: false,
      },
    ];
  } else if (role === 'STAFF') {
    navItems = [
      {
        id: 'scanner' as ActiveTab,
        label: 'Garita QR',
        icon: ScanLine,
        highlight: true,
      },
      {
        id: 'attendance' as ActiveTab,
        label: 'Asistencia',
        icon: Clock,
        highlight: false,
      },
      {
        id: 'settings' as ActiveTab,
        label: 'Ajustes',
        icon: Settings,
        highlight: false,
      },
    ];
  }

  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 px-3 pointer-events-none no-print"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-2xl text-white rounded-3xl p-1.5 shadow-2xl border border-white/15 dark:border-slate-800 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative -top-4 flex flex-col items-center justify-center min-w-[56px] min-h-[56px] p-2.5 rounded-2xl shadow-xl transition-all active:scale-90 duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-indigo-400 text-white shadow-glow-brand ring-4 ring-slate-900'
                      : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-brand-300 hover:text-white ring-4 ring-slate-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-extrabold tracking-tight mt-0.5">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center min-h-[48px] py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/15 font-extrabold scale-105 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5px] text-brand-400' : 'stroke-2'}`} />
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
