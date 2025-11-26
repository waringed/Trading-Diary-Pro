import React, { useRef, useState } from 'react';
import { TradeEntry, AppConfig, CalculatedDay } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TradeEntry[];
  config: AppConfig;
  processedData: CalculatedDay[];
  onImport: (entries: TradeEntry[], config: AppConfig) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ 
  isOpen, onClose, entries, config, processedData, onImport 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for staging the import before applying
  const [pendingImport, setPendingImport] = useState<{
    entries: TradeEntry[];
    config: AppConfig;
    filename: string;
  } | null>(null);

  if (!isOpen) return null;

  // --- 1. EXPORT TO CSV (EXCEL) ---
  const handleExportCSV = () => {
    // Define Headers
    const headers = [
      "Fecha",
      "Semana",
      "Mes",
      "Capital Inicial Diario",
      "Capital Final Diario",
      "P/L Diario ($)",
      "P/L Diario (%)",
      "P/L Semanal ($)",
      "P/L Semanal (%)",
      "P/L Mensual ($)",
      "P/L Mensual (%)",
      "P/L Total ($)",
      "P/L Total (%)"
    ];

    // Map Data to CSV Rows
    const rows = [...processedData].reverse().map(day => [
      day.date,
      day.weekId,
      day.monthId,
      day.initialCapitalDaily.toFixed(2),
      day.finalCapital.toFixed(2),
      day.plDailyDollar.toFixed(2),
      (day.plDailyPercent / 100).toFixed(4), 
      day.plWeekToDateDollar.toFixed(2),
      (day.plWeekToDatePercent / 100).toFixed(4),
      day.plMonthToDateDollar.toFixed(2),
      (day.plMonthToDatePercent / 100).toFixed(4),
      day.plTotalToDateDollar.toFixed(2),
      (day.plTotalToDatePercent / 100).toFixed(4),
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Updated filename with WTA prefix
    link.setAttribute("download", `WTA_Bitacora_Trading_Excel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 2. EXPORT BACKUP (JSON) ---
  const handleExportBackup = () => {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      entries,
      config
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Updated filename with WTA prefix
    link.setAttribute("download", `WTA_Respaldo_Bitacora_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. READ FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPendingImport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic Validation
        if (!json.entries || !Array.isArray(json.entries)) {
          throw new Error("El archivo no tiene un formato válido de historial.");
        }
        
        // Stage for confirmation instead of immediate alert
        setPendingImport({
            entries: json.entries,
            config: json.config || config,
            filename: file.name
        });

      } catch (err) {
        setError("Error: El archivo está dañado o no es un respaldo válido de esta app.");
        console.error(err);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
      if (pendingImport) {
          onImport(pendingImport.entries, pendingImport.config);
          setPendingImport(null);
          onClose();
      }
  };

  const triggerFileInput = () => {
     setError(null);
     setPendingImport(null);
     fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            Respaldos y Exportación
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-8">
          
          {/* WARNING BLOCK */}
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Importante: Sobre tus Datos
            </h3>
            <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
                <p>
                    Tus registros se guardan <strong>únicamente en este navegador</strong>.
                </p>
                <p className="text-amber-200/80 font-medium mt-1">
                    Recomendación: Usa el botón "Crear Respaldo" frecuentemente.
                </p>
            </div>
          </div>

          {/* EXPORT SECTION */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Acciones</h3>
            <div className="grid gap-4">
                {/* Export Excel */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-200 font-medium">Exportar a Excel (CSV)</p>
                        <p className="text-slate-500 text-sm mt-1">Descarga tus métricas.</p>
                    </div>
                    <button 
                        onClick={handleExportCSV}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Descargar
                    </button>
                </div>

                {/* Backup JSON */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-200 font-medium">Crear Respaldo</p>
                        <p className="text-slate-500 text-sm mt-1">Guarda copia de seguridad.</p>
                    </div>
                    <button 
                        onClick={handleExportBackup}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Exportar
                    </button>
                </div>

                {/* IMPORT SECTION */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-slate-200 font-medium">Restaurar Respaldo</p>
                            <p className="text-slate-500 text-sm mt-1">Carga un archivo .json</p>
                        </div>
                        <button 
                            onClick={triggerFileInput}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Seleccionar Archivo
                        </button>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mt-3 bg-rose-900/20 border border-rose-500/30 text-rose-300 p-3 rounded-md text-sm flex items-start gap-2 animate-in fade-in">
                             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {error}
                        </div>
                    )}

                    {/* CONFIRMATION UI */}
                    {pendingImport && (
                        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 animate-in slide-in-from-top-2">
                            <h4 className="font-bold text-blue-100 mb-2">Archivo listo para importar</h4>
                            <div className="text-sm text-blue-200 space-y-1 mb-4">
                                <p>Archivo: <span className="text-white">{pendingImport.filename}</span></p>
                                <p>Registros encontrados: <span className="text-white font-bold">{pendingImport.entries.length}</span></p>
                                <p className="text-xs opacity-75 mt-2 bg-blue-900/40 p-2 rounded">
                                    ⚠️ Al confirmar, se reemplazarán todos tus datos actuales con los de este archivo.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setPendingImport(null)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmImport}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
                                >
                                    CONFIRMAR IMPORTACIÓN
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>

        </div>
        <div className="bg-slate-900 p-4 flex justify-end">
            <button onClick={onClose} className="text-slate-400 hover:text-white font-medium text-sm">Cerrar</button>
        </div>
      </div>
    </div>
  );
};