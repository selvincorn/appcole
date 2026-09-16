import React from 'react';
import { Student, TuitionFee } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  Printer, 
  GraduationCap, 
  Calendar
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  fees: TuitionFee[];
  singleFee?: TuitionFee | null; // Si se abre para una cuota específica
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  student,
  fees,
  singleFee,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (val: number) => {
    return `Q${val.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const today = new Date().toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayFees = singleFee ? [singleFee] : fees;

  const subtotal = displayFees.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalLate = displayFees.reduce((acc, f) => acc + (Number(f.late_fee) || 0), 0);
  const grandTotal = subtotal + totalLate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={singleFee ? 'Comprobante de Pago Oficial' : 'Estado de Cuenta Preliminar'}
      subtitle={student.student_code}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Contenedor imprimible */}
        <div className="printable-area bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-slate-800">
          {/* Cabecera oficial del Colegio */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Colegio El Renuevo
                </h2>
                <p className="text-xs text-slate-500">
                  Resolución Ministerial No. 2026-EDU-042 • NIT: 4928172-1
                </p>
                <p className="text-[11px] text-slate-400">
                  Km 14.5 Calzada Principal, Guatemala
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                {singleFee?.receipt_number || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                Fecha: {today}
              </p>
            </div>
          </div>

          {/* Datos del Alumno y Padre */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Estudiante:</p>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                {student.first_name} {student.last_name}
              </p>
              <p className="text-slate-500 mt-0.5">
                Grado: {student.grade_level} "{student.section}"
              </p>
              <p className="text-brand-700 font-mono font-bold mt-0.5">
                Carnet: {student.student_code}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Padre / Encargado:</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                Ing. Selvin Morales
              </p>
              <p className="text-slate-500 mt-0.5">Contacto: +502 5555-1234</p>
              <p className="text-slate-500 mt-0.5">Ciclo Escolar: 2026</p>
            </div>
          </div>

          {/* Tabla de Rubros y Colegiaturas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Concepto / Descripción</th>
                  <th className="py-2.5 px-2 text-center">Vencimiento</th>
                  <th className="py-2.5 px-2 text-center">Estado</th>
                  <th className="py-2.5 px-2 text-right">Mora</th>
                  <th className="py-2.5 px-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 font-medium text-slate-800">
                      <div>{fee.concept}</div>
                      {fee.paid_at && (
                        <span className="text-[10px] text-emerald-600 font-normal">
                          Pagado el {new Date(fee.paid_at).toLocaleDateString('es-GT')} ({fee.payment_method || 'TARJETA'})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">
                      {fee.due_date}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.status === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : fee.status === 'VENCIDO'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500 font-mono">
                      {Number(fee.late_fee) > 0 ? formatMoney(Number(fee.late_fee)) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-slate-900 font-mono">
                      {formatMoney(Number(fee.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y Sello */}
          <div className="pt-3 border-t-2 border-slate-200 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 italic">
              * Documento informativo preliminar generado desde el portal escolar AppCole.
            </div>

            <div className="w-full sm:w-56 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Cuotas:</span>
                <span className="font-mono">{formatMoney(subtotal)}</span>
              </div>
              {totalLate > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Recargo por Mora:</span>
                  <span className="font-mono">+{formatMoney(totalLate)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span className="font-mono">{formatMoney(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="flex gap-2 justify-end no-print pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
