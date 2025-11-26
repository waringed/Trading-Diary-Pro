import React, { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [totalCap, setTotalCap] = useState(config.totalInitialCapital.toString());
  const [monthKey, setMonthKey] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [monthCap, setMonthCap] = useState('');

  if (!isOpen) return null;

  const handleSaveGlobal = () => {
    onSave({
      ...config,
      totalInitialCapital: parseFloat(totalCap) || 0
    });
  };

  const handleSetMonth = () => {
    if (monthKey && monthCap) {
      onSave({
        ...config,
        monthlyStartCapitals: {
          ...config.monthlyStartCapitals,
          [monthKey]: parseFloat(monthCap)
        }
      });
      setMonthCap('');
    }
  };

  const handleRemoveMonth = (key: string) => {
    const newMap = { ...config.monthlyStartCapitals };
    delete newMap[key];
    onSave({ ...config, monthlyStartCapitals: newMap });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Configuración de Capital</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Global Config */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Capital Inicial Total (Global)
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={totalCap}
                onChange={(e) => setTotalCap(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <button 
                onClick={handleSaveGlobal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Actualizar
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Base para el cálculo de P/L Total Histórico.</p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Reset Mensual Manual</h3>
            <p className="text-xs text-slate-400 mb-4">
              Si retiras ganancias o depositas, define el capital inicial exacto para un mes específico. Si no se define, se usa el final del mes anterior.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-slate-400">Mes</label>
                <input 
                  type="month" 
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Capital Inicial ($)</label>
                <input 
                  type="number" 
                  value={monthCap}
                  onChange={(e) => setMonthCap(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <button 
              onClick={handleSetMonth}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium"
            >
              Establecer Inicio Mensual
            </button>

            {/* List of Overrides */}
            <div className="mt-4 space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold">Configuraciones Guardadas</label>
              {Object.keys(config.monthlyStartCapitals).length === 0 && (
                <p className="text-sm text-slate-600 italic">Ninguna. (Automático)</p>
              )}
              {Object.entries(config.monthlyStartCapitals).sort().map(([key, val]) => (
                <div key={key} className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded border border-slate-700">
                  <span className="text-sm text-slate-200 font-mono">{key}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-400 font-bold">${val}</span>
                    <button 
                      onClick={() => handleRemoveMonth(key)}
                      className="text-slate-500 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
