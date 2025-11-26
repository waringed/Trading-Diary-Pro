import React, { useState, useEffect, useRef } from 'react';
import { TradeEntry } from '../types';

interface EditEntryModalProps {
  entry: TradeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newDate: string, newCapital: number, initialCapital?: number) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, isOpen, onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [capital, setCapital] = useState('');
  const [initialCapital, setInitialCapital] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setCapital(entry.finalCapital.toString());
      setInitialCapital(entry.initialCapital ? entry.initialCapital.toString() : '');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initCap = initialCapital ? parseFloat(initialCapital) : undefined;
    onSave(entry.id, date, parseFloat(capital), initCap);
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
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm">
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
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Capital Inicial ($)</label>
            <input
              type="number"
              step="0.01"
              value={initialCapital}
              placeholder="Automático (Día anterior)"
              onChange={(e) => setInitialCapital(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">Déjalo vacío para usar el cierre del día anterior.</p>
          </div>

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