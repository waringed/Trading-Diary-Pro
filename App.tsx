import React, { useState, useEffect, useMemo } from 'react';
import { TradeEntry, AppConfig, CalculatedDay } from './types';
import { processEntries, calculatePeriodSummaries, calculateGlobalStats } from './utils/calculations';

// Components
import { EntryForm } from './components/EntryForm';
import { MetricCard } from './components/MetricCard';
import { HistoryTable } from './components/HistoryTable';
import { StatsPanel } from './components/StatsPanel';
import { SettingsModal } from './components/SettingsModal';
import { EditEntryModal } from './components/EditEntryModal';
import { DeleteModal } from './components/DeleteModal';
import { Charts } from './components/Charts';
import { CapitalSummary } from './components/CapitalSummary';
import { DataManagementModal } from './components/DataManagementModal';
import { InfoModal } from './components/InfoModal';

const DEFAULT_CONFIG: AppConfig = {
  totalInitialCapital: 1000,
  monthlyStartCapitals: {}
};

// Simple ID generator to avoid external dependencies
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export default function App() {
  // State
  const [entries, setEntries] = useState<TradeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('trading_entries');
      if (saved) {
          const parsed = JSON.parse(saved);
          // Migration: Ensure all have IDs
          return parsed.map((e: any) => ({
              ...e,
              id: e.id || generateId()
          }));
      }
      return [];
    } catch (e) {
      console.error("Error loading entries", e);
      return [];
    }
  });
  
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('trading_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      console.error("Error loading config", e);
      return DEFAULT_CONFIG;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TradeEntry | null>(null);
  
  // State for deletion
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('trading_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('trading_config', JSON.stringify(config));
  }, [config]);

  // Calculations
  const processedData: CalculatedDay[] = useMemo(() => {
    return processEntries(entries, config);
  }, [entries, config]);

  const latestDay = processedData.length > 0 ? processedData[0] : null;

  const weeklySummaries = useMemo(() => calculatePeriodSummaries(processedData, 'weekId'), [processedData]);
  const monthlySummaries = useMemo(() => calculatePeriodSummaries(processedData, 'monthId'), [processedData]);
  const quarterlySummaries = useMemo(() => calculatePeriodSummaries(processedData, 'quarterId'), [processedData]);
  const yearlySummaries = useMemo(() => calculatePeriodSummaries(processedData, 'yearId'), [processedData]);

  const globalStats = useMemo(() => 
    calculateGlobalStats(processedData, weeklySummaries, monthlySummaries), 
  [processedData, weeklySummaries, monthlySummaries]);

  // Handlers
  const handleAddEntry = (date: string, finalCapital: number) => {
    // Check if exists
    const existingIndex = entries.findIndex(e => e.date === date);
    if (existingIndex >= 0) {
      if (!window.confirm("Ya existe un registro para esta fecha. ¿Deseas sobrescribirlo?")) return;
      const newEntries = [...entries];
      newEntries[existingIndex] = { ...newEntries[existingIndex], finalCapital };
      setEntries(newEntries);
    } else {
      setEntries([...entries, { id: generateId(), date, finalCapital }]);
    }
  };

  // Step 1: Request Delete (Opens Modal)
  const requestDeleteEntry = (id: string) => {
    setEntryToDelete(id);
  };

  // Step 2: Confirm Delete (Executes logic)
  const confirmDeleteEntry = () => {
    if (entryToDelete) {
      setEntries(prevEntries => prevEntries.filter(e => e.id !== entryToDelete));
      setEntryToDelete(null);
    }
  };

  const handleUpdateEntry = (id: string, newDate: string, newCapital: number, initialCapital?: number) => {
    // Check for collision if date changed
    const collision = entries.find(e => e.date === newDate && e.id !== id);
    
    if (collision) {
      if (!window.confirm(`Ya existe otro registro para la fecha ${newDate}. ¿Deseas reemplazarlo con este cambio?`)) {
        return;
      }
      // Remove the colliding entry, then update the current one
      setEntries(prev => {
          const filtered = prev.filter(e => e.id !== collision.id);
          return filtered.map(e => {
            if (e.id === id) {
                return { ...e, date: newDate, finalCapital: newCapital, initialCapital };
            }
            return e;
          });
      });
    } else {
      // Normal update
      setEntries(prev => prev.map(e => {
          if (e.id === id) {
              return { ...e, date: newDate, finalCapital: newCapital, initialCapital };
          }
          return e;
      }));
    }
    setEditingEntry(null);
  };

  const handleImportData = (newEntries: TradeEntry[], newConfig: AppConfig) => {
      // Security: Sanitize entries to ensure they have IDs
      const sanitizedEntries = newEntries.map(e => ({
          ...e,
          id: e.id || generateId()
      }));

      setEntries(sanitizedEntries);
      setConfig(newConfig);
      // Force persistence immediately to avoid sync issues
      localStorage.setItem('trading_entries', JSON.stringify(sanitizedEntries));
      localStorage.setItem('trading_config', JSON.stringify(newConfig));
  };

  // Safe accessors for current metrics
  const currentWeekSummary = latestDay ? weeklySummaries.find(w => w.periodId === latestDay.weekId) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header - Logo & Actions */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <img src="https://global-files-nginx.builderall.com/0e184df7-813a-4af4-89e6-7f8094a855e1/ef6b703c3cb1d27fce2d6a3c1eef779fe760031f15a5a5082483cc423999dd6f.png" alt="Waring Trading Academy" className="h-32 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
              {/* Important Warning Button */}
              <button 
                onClick={() => setIsInfoModalOpen(true)}
                className="text-sm font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-amber-900/10 hover:bg-amber-900/30 px-3 py-1.5 rounded transition-colors border border-amber-500/30 hover:border-amber-500/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Aviso Importante
              </button>

              <button 
                onClick={() => setIsDataModalOpen(true)}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors border border-slate-700 hover:border-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                Respaldos / Exportar
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors border border-slate-700 hover:border-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Configurar Capital
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        
        {/* HERO SECTION - New Branding */}
        <div className="text-center pb-4 border-b border-slate-800/50 mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                Trading Diary <span className="text-blue-500">PRO</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Gestión profesional de capital y análisis de rendimiento en tiempo real.
            </p>
        </div>

        {/* Top Section: Controls & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-3">
             <EntryForm onAddEntry={handleAddEntry} lastDate={latestDay?.date} />
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
              <MetricCard 
                label="P/L Día" 
                valueDollar={latestDay?.plDailyDollar || 0} 
                valuePercent={latestDay?.plDailyPercent || 0}
                subtext={latestDay?.date}
              />
              <MetricCard 
                label="P/L Semana (Acum.)" 
                valueDollar={currentWeekSummary?.plDollar || 0} 
                valuePercent={currentWeekSummary?.plPercent || 0}
                subtext="Semana actual"
              />
              <MetricCard 
                label="P/L Mes (Acum.)" 
                valueDollar={latestDay?.plMonthToDateDollar || 0} 
                valuePercent={latestDay?.plMonthToDatePercent || 0}
                subtext="Vs. Inicio Mes"
              />
              <MetricCard 
                label="P/L Total (Global)" 
                valueDollar={latestDay?.plTotalToDateDollar || 0} 
                valuePercent={latestDay?.plTotalToDatePercent || 0}
                subtext="Vs. Capital Inicial"
              />
            </div>
          </div>
        </div>

        {/* Stacked Full Width Components - REORDERED FOR BETTER UX */}
        <div className="space-y-4">
            {/* 1. Capital Summary (KPIs) - Most important info first */}
            <CapitalSummary stats={globalStats} />

            {/* 2. Chart (Visual Trend) - Context immediately after status */}
            <Charts data={processedData} />

            {/* 3. Detailed Stats (Analysis) - Deeper dive */}
            <StatsPanel stats={globalStats} />

            {/* 4. History Table (Raw Data) - At the bottom */}
            <HistoryTable 
              data={processedData} 
              weekly={weeklySummaries}
              monthly={monthlySummaries}
              quarterly={quarterlySummaries}
              yearly={yearlySummaries}
              onDelete={requestDeleteEntry} 
              onEdit={(day) => {
                  const original = entries.find(e => e.id === day.id);
                  if (original) setEditingEntry(original);
              }}
            />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">
                &copy;2025 Waring Trading Academy. Todos los derechos reservados. App creada con ❤️ por <a href="https://mercamocion.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">mercamocion.com</a>
            </p>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={(newConfig) => {
          setConfig(newConfig);
          setIsSettingsOpen(false);
        }}
      />

      <DataManagementModal 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        entries={entries}
        config={config}
        processedData={processedData}
        onImport={handleImportData}
      />

      <EditEntryModal 
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleUpdateEntry}
      />
      
      <DeleteModal 
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDeleteEntry}
      />

      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}