
import React, { useState, useEffect, useRef } from 'react';
import { TradeEntry } from '../types';

interface EditEntryModalProps {
  entry: TradeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newDate: string, newCapital: number, deposit: number, withdrawal: number, notes?: string, tradeCount?: number) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, isOpen, onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [capital, setCapital] = useState('');
  const [tradeCount, setTradeCount] = useState('');
  const [deposit, setDeposit] = useState('');
  const [withdrawal, setWithdrawal] = useState('');
  const [notes, setNotes] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setCapital(entry.finalCapital.toString());
      setTradeCount(entry.tradeCount !== undefined ? entry.tradeCount.toString() : '');
      setDeposit(entry.deposit && entry.deposit > 0 ? entry.deposit.toString() : '');
      setWithdrawal(entry.withdrawal && entry.withdrawal > 0 ? entry.withdrawal.toString() : '');
      setNotes(entry.notes || '');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trades = tradeCount ? parseInt(tradeCount) : 0;
    const dep = deposit ? parseFloat(deposit) : 0;
    const withdr = withdrawal ? parseFloat(withdrawal) : 0;
    onSave(entry.id, date, parseFloat(capital), dep, withdr, notes, trades);
    onClose();
  };

  const openDatePicker = () => {
      if (dateInputRef.current) {
          if (dateInputRef.current.showPicker) {
              try {
                  dateInputRef.current.showPicker();
              } catch (error) { /* ignore */ }
          } else {
              dateInputRef.current.focus();
          }
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Editar Registro</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
            <div className="relative group cursor-pointer" onClick={openDatePicker}>
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <input
                ref={dateInputRef}
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="date-input-full-click w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Capital Final ($)</label>
                <input
                type="number"
                required
                step="0.01"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">N° Operaciones</label>
                <input
                type="number"
                min="0"
                step="1"
                value={tradeCount}
                onChange={(e) => setTradeCount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
             <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Depósito</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-rose-400 mb-1">Retiro</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawal}
                    onChange={(e) => setWithdrawal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
             </div>
        </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notas / Lecciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué aprendiste hoy? (Errores, aciertos, emociones y sentimientos) #Hashtags"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-sm"
            />
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
