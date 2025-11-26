import React, { useState, useRef } from 'react';
import { Card } from './ui/Card';

interface EntryFormProps {
  onAddEntry: (date: string, finalCapital: number) => void;
  lastDate?: string;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry, lastDate }) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(getToday());
  const [capital, setCapital] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && capital) {
      onAddEntry(date, parseFloat(capital));
      setCapital('');
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
        if (dateInputRef.current.showPicker) {
            try {
                dateInputRef.current.showPicker();
            } catch (error) {
                // Fallback or ignore if not supported
            }
        } else {
            // For older browsers, try focus
            dateInputRef.current.focus();
        }
    }
  };

  return (
    <Card title="Nuevo Registro Diario" className="h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
          <div className="relative group cursor-pointer" onClick={openDatePicker}>
            {/* Custom Icon positioned absolutely */}
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
              // Use the CSS class defined in index.html to make the picker indicator cover the whole input
              className="date-input-full-click w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Capital Final ($)</label>
          <input
            type="number"
            required
            step="0.01"
            placeholder="0.00"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          Registrar Día
        </button>
        {lastDate && <p className="text-xs text-slate-500 text-center">Último registro: {lastDate}</p>}
      </form>
    </Card>
  );
};