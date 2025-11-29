import React from 'react';

interface OverwriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  date: string;
}

export const OverwriteModal: React.FC<OverwriteModalProps> = ({ isOpen, onClose, onConfirm, date }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Registro Duplicado</h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Ya existe información registrada para el día <span className="font-bold text-white">{date}</span>.
            <br/><br/>
            ¿Deseas reemplazar los datos existentes con esta nueva información?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
            >
              Sí, Reemplazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};