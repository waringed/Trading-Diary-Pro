
import React, { useState, useRef } from 'react';
import { Card } from './ui/Card';
import { TradeEntry } from '../types';

interface EntryFormProps {
  onAddEntry: (date: string, finalCapital: number, deposit: number, withdrawal: number, notes?: string, tradeCount?: number) => void;
  lastDate?: string;
  lastCapital?: number;
  entries: TradeEntry[];
}

export const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry, lastDate, lastCapital, entries }) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(getToday());
  const [capital, setCapital] = useState('');
  // UX Improvement: Default to 1 trade as most entries imply activity
  const [tradeCount, setTradeCount] = useState('1'); 
  const [deposit, setDeposit] = useState('');
  const [withdrawal, setWithdrawal] = useState('');
  const [notes, setNotes] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Check for manual capital adjustment
  const existingAdjustment = entries.find(e => e.date === date && e.initialCapital !== undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && capital) {
      const trades = tradeCount ? parseInt(tradeCount) : 0;
      const dep = deposit ? parseFloat(deposit) : 0;
      const withdr = withdrawal ? parseFloat(withdrawal) : 0;
      
      onAddEntry(date, parseFloat(capital), dep, withdr, notes, trades);
      
      setCapital('');
      setTradeCount('1'); // Reset to 1 for the next entry
      setDeposit('');
      setWithdrawal('');
      setNotes('');
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
        if (dateInputRef.current.showPicker) {
            try {
                dateInputRef.current.showPicker();
            } catch (error) {
                // Fallback
            }
        } else {
            dateInputRef.current.focus();
        }
    }
  };

  return (
    <Card title="Nuevo Registro Diario" className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* ROW 1: Numeric Inputs - 5 Equal Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            
            {/* 1. Date */}
            <div className="col-span-1">
                <label className="block text-sm font-bold text-slate-300 mb-1">Fecha</label>
                <div className="relative group cursor-pointer" onClick={openDatePicker}>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400 group-hover:text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input
                    ref={dateInputRef}
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input-full-click w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
                {lastDate && <p className="text-[10px] text-slate-500 mt-1 truncate">Previo: {lastDate}</p>}
            </div>

            {/* 2. Final Capital (MOVED HERE) */}
            <div className="col-span-1">
                <label className="block text-sm font-bold text-slate-300 mb-1">Capital Final ($)</label>
                <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                 {existingAdjustment && (
                    <div className="text-[10px] text-blue-400 mt-1 leading-tight">
                        ℹ️ Ajuste detectado: Inicias con ${existingAdjustment.initialCapital}
                    </div>
                 )}
            </div>

            {/* 3. Ops (MOVED HERE) */}
            <div className="col-span-1">
                <label className="block text-sm font-bold text-slate-300 mb-1">N° Operaciones</label>
                <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1"
                    value={tradeCount}
                    onChange={(e) => setTradeCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

             {/* 4. Deposit (MOVED HERE) */}
             <div className="col-span-1">
                <label className="block text-sm font-bold text-emerald-400 mb-1">Depósito (Opcional)</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-6 pr-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                </div>
             </div>

             {/* 5. Withdrawal (MOVED HERE) */}
             <div className="col-span-1">
                <label className="block text-sm font-bold text-rose-400 mb-1">Retiro (Opcional)</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={withdrawal}
                        onChange={(e) => setWithdrawal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-6 pr-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                </div>
             </div>
        </div>

        {/* ROW 2: Notes & Button */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-10">
                <label className="block text-sm font-bold text-slate-300 mb-1">Notas / Lecciones (Opcional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="¿Qué aprendiste hoy? (Errores, aciertos, emociones y sentimientos) #Hashtags"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px] focus:h-20 transition-all resize-none text-sm placeholder-slate-600"
                />
            </div>
            
            <div className="lg:col-span-2">
                <button
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
                className="w-full h-[38px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20 text-sm flex items-center justify-center gap-2"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Registrar
                </button>
            </div>
        </div>
      </form>
    </Card>
  );
};
