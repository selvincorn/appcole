import React, { useState } from 'react';
import { Student } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  ShieldCheck, 
  UserCheck, 
  QrCode, 
  Share2, 
  Clock, 
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface GatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [authorizedPerson, setAuthorizedPerson] = useState('Abuela María Rodas');
  const [dpi, setDpi] = useState('2451 90812 0101');
  const [relationship, setRelationship] = useState('Abuela materna');
  const [reason, setReason] = useState('Cita médica odontológica');
  const [passGenerated, setPassGenerated] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  const todayStr = new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const passCode = `PASE-${student.student_code}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Pase de Salida Escolar - Colegio El Renuevo*\n` +
      `Estudiante: ${student.full_name} (${student.grade})\n` +
      `Autorizado(a): ${authorizedPerson} (DPI: ${dpi})\n` +
      `Motivo: ${reason}\n` +
      `Código de Autorización: ${passCode}\n` +
      `Válido únicamente para hoy: ${todayStr}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pase de Retiro / Salida Anticipada"
      subtitle="Autorización electrónica para garita de seguridad"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* State 1: Formulario / Configuración */}
        {!passGenerated ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPassGenerated(true);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nombre de la persona autorizada a recoger al alumno
              </label>
              <input
                type="text"
                required
                value={authorizedPerson}
                onChange={(e) => setAuthorizedPerson(e.target.value)}
                placeholder="Ej. Carmen Sandoval (Tía)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  DPI / Documento
                </label>
                <input
                  type="text"
                  required
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="2451 90812 0101"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Abuelo / Tío / Transporte"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Motivo del Retiro Anticipado
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Cita médica, urgencia familiar, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
            >
              Generar Pase Electrónico
            </button>
          </form>
        ) : (
          /* State 2: Pase Generado con QR Oficial */
          <div className="space-y-4">
            {/* Card del Pase */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                      Autorización Verificada
                    </span>
                    <h3 className="text-sm font-bold text-white">Pase Oficial de Salida</h3>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-brand-300 font-bold">
                  {student.grade}
                </span>
              </div>

              {/* Contenido del pase */}
              <div className="grid grid-cols-3 gap-3 my-4 items-center">
                <div className="col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Alumno a Retirar</span>
                    <span className="text-sm font-black text-white">{student.full_name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Persona Autorizada</span>
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{authorizedPerson}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 font-mono">DPI: {dpi}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Motivo</span>
                    <span className="text-slate-200">{reason}</span>
                  </div>
                </div>

                {/* QR Code de Seguridad */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white text-slate-900 shadow-md">
                  <QrCode className="w-20 h-20 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 uppercase">
                    Escanear en Garita
                  </span>
                </div>
              </div>

              {/* Fecha de validez */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Válido hoy: {new Date().toLocaleDateString('es-GT')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jornada Escolar</span>
                </div>
              </div>
            </div>

            {/* Token Code & Actions */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Código Único</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {passCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>

              <button
                onClick={() => setPassGenerated(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                Modificar Datos
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                El guardia de garita solicitará el DPI físico a <strong>{authorizedPerson}</strong> para verificar la identidad antes de autorizar la salida de {student.first_name}.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
