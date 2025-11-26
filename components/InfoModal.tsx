import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-amber-500/30 rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        
        {/* Header Warning */}
        <div className="bg-amber-900/20 border-b border-amber-500/20 p-6 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-full">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Aviso Importante</h2>
                <p className="text-amber-400 text-sm font-medium">Sobre el almacenamiento de tus datos</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-300 leading-relaxed">
            <p className="font-medium text-white">
                Esta aplicación funciona localmente en tu dispositivo.
            </p>
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 text-sm">
                <p>
                    <span className="text-blue-400 font-bold">1. Dónde están tus datos:</span><br/>
                    Viven dentro de la memoria de este navegador web específico (Chrome, Edge, Safari, etc.). No se envían a ningún servidor externo.
                </p>
                <p>
                    <span className="text-emerald-400 font-bold">2. Persistencia:</span><br/>
                    Si cierras la pestaña o apagas la computadora, tus datos <strong>seguirán aquí</strong> cuando vuelvas. No se borran solos.
                </p>
            </div>

            <div className="space-y-2">
                <p className="font-bold text-rose-400 text-sm uppercase tracking-wider">⚠️ Riesgos de pérdida de datos:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400 marker:text-rose-500">
                    <li>Si borras el <strong>historial de navegación y cookies</strong>.</li>
                    <li>Si usas la aplicación en <strong>Modo Incógnito</strong> (se borra todo al cerrar).</li>
                    <li>Si entras desde otra computadora o celular, verás la app vacía (no se sincronizan).</li>
                </ul>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded text-sm text-blue-200 flex gap-3 items-start">
                <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>
                    <strong>Recomendación Pro:</strong> Usa el botón "Respaldos / Exportar" frecuentemente para guardar una copia de seguridad en tu computadora.
                </p>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end rounded-b-xl">
            <button 
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Entendido
            </button>
        </div>
      </div>
    </div>
  );
};