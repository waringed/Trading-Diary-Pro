
import React, { useState, useEffect } from 'react';
import { AppConfig, TradeEntry } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  entries?: TradeEntry[];
  onResetApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, config, onSave, onResetApp
}) => {
  const [totalCap, setTotalCap] = useState(config.totalInitialCapital.toString());
  
  // State for Reset Confirmation
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [isResetExpanded, setIsResetExpanded] = useState(false);

  // Reset state whenever the modal opens to ensure a clean slate
  useEffect(() => {
    if (isOpen) {
        setTotalCap(config.totalInitialCapital.toString());
        setResetConfirmation('');
        setIsResetExpanded(false);
    }
  }, [isOpen, config.totalInitialCapital]);

  if (!isOpen) return null;

  const handleSaveGlobal = () => {
    onSave({
      ...config,
      totalInitialCapital: parseFloat(totalCap) || 0
    });
    onClose();
  };

  const handleResetConfirm = () => {
    if (resetConfirmation === 'ELIMINAR') {
        onResetApp();
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">Configurar Capital</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Capital Inicial Histórico</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Este es el monto con el que iniciaste tu carrera de trading (Día 1). Sirve de base para el cálculo del P/L Total.
                </p>
                
                <div className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input 
                            type="number" 
                            value={totalCap}
                            onChange={(e) => setTotalCap(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-6 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSaveGlobal}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-colors"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>

             {/* DANGER ZONE - RESET */}
            <div className="border-t border-slate-700 pt-6">
              <button 
                onClick={() => setIsResetExpanded(!isResetExpanded)}
                className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-2 transition-colors w-full justify-between"
              >
                 <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Zona de Peligro: Restablecer App
                 </span>
                 <svg className={`w-4 h-4 transition-transform ${isResetExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isResetExpanded && (
                  <div className="mt-4 bg-rose-950/30 border border-rose-500/30 rounded-lg p-4 animate-in slide-in-from-top-2">
                      <p className="text-slate-300 text-sm mb-4">
                        Esto eliminará permanentemente todos tus registros, notas y configuraciones. La aplicación volverá a su estado original (vacía). 
                        <strong className="block mt-1 text-rose-400">Esta acción no se puede deshacer.</strong>
                      </p>
                      
                      <div className="space-y-3">
                          <label className="block text-xs uppercase text-slate-500 font-bold">Escribe <span className="text-white select-all">ELIMINAR</span> para confirmar</label>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={resetConfirmation}
                                onChange={(e) => setResetConfirmation(e.target.value)}
                                placeholder="ELIMINAR"
                                className="bg-slate-900 border border-rose-900 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                              />
                              <button 
                                onClick={handleResetConfirm}
                                disabled={resetConfirmation !== 'ELIMINAR'}
                                className={`px-4 py-2 rounded font-bold transition-all whitespace-nowrap ${
                                    resetConfirmation === 'ELIMINAR' 
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                BORRAR TODO
                              </button>
                          </div>
                      </div>
                  </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
