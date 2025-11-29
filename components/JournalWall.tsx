
import React, { useState, useEffect } from 'react';
import { CalculatedDay } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Card } from './ui/Card';

interface JournalWallProps {
  data: CalculatedDay[];
}

type FilterType = 'all' | 'winners' | 'losers';
type SortOrder = 'desc' | 'asc';

export const JournalWall: React.FC<JournalWallProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Newest first by default
  const [dayFilter, setDayFilter] = useState<string>('all'); // 'all', '1' (Mon), '2' (Tue)...
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Notes are tall, so default to 5

  // Helper for Day Names
  const daysOfWeek = [
    { id: '1', label: 'Lunes' },
    { id: '2', label: 'Martes' },
    { id: '3', label: 'Miércoles' },
    { id: '4', label: 'Jueves' },
    { id: '5', label: 'Viernes' },
    { id: '6', label: 'Sábado' },
    { id: '0', label: 'Domingo' },
  ];

  // 1. Get only days with notes
  const rawJournalEntries = data.filter(day => day.notes && day.notes.trim().length > 0);

  // 2. Apply Filters
  const filteredEntries = rawJournalEntries.filter(day => {
    // A. Filter by Type (Win/Loss)
    const isWin = day.plDailyDollar >= 0;
    if (filterType === 'winners' && !isWin) return false;
    if (filterType === 'losers' && isWin) return false;

    // B. Filter by Day of Week
    if (dayFilter !== 'all') {
        // Safe parsing to avoid timezone issues
        const [y, m, d] = day.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayIndex = dateObj.getDay().toString();
        if (dayIndex !== dayFilter) return false;
    }

    // C. Filter by Date Range
    if (filterStartDate && day.date < filterStartDate) return false;
    if (filterEndDate && day.date > filterEndDate) return false;

    // D. Filter by Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const content = (day.notes || '').toLowerCase();
      const dateStr = day.date.toLowerCase();
      return content.includes(term) || dateStr.includes(term);
    }

    return true;
  });

  // 3. Apply Sorting
  const sortedEntries = filteredEntries.sort((a, b) => {
      if (sortOrder === 'asc') {
          return a.date.localeCompare(b.date); // Oldest first
      } else {
          return b.date.localeCompare(a.date); // Newest first
      }
  });

  // 4. Pagination Logic
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  
  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortOrder, dayFilter, filterStartDate, filterEndDate, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEntries.slice(indexOfFirstItem, indexOfLastItem);

  // Display range helpers
  const startRange = sortedEntries.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRange = Math.min(indexOfLastItem, sortedEntries.length);


  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDayFilter('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSortOrder('desc');
  };

  const handleExportNotes = () => {
    if (sortedEntries.length === 0) return;

    let content = `DIARIO DE TRADING - WTA\n`;
    content += `Reporte de Notas Filtradas\n`;
    content += `Generado: ${new Date().toLocaleDateString()}\n`;
    content += `Total de entradas: ${sortedEntries.length}\n\n`;
    content += `==================================================================\n\n`;

    sortedEntries.forEach(day => {
        // Get Day Name
        const [y, m, d] = day.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const isWin = day.plDailyDollar >= 0;

        content += `FECHA:      ${day.date} (${capitalizedDay})\n`;
        content += `RESULTADO:  ${formatCurrency(day.plDailyDollar)} (${formatPercent(day.plDailyPercent)}) - ${isWin ? 'GANADOR' : 'PERDEDOR'}\n`;
        content += `OPERACIONES: ${day.tradeCount || 0}\n`;
        content += `------------------------------------------------------------------\n`;
        content += `${day.notes}\n`;
        content += `==================================================================\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WTA_Notas_Trading_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchTerm !== '' || filterType !== 'all' || dayFilter !== 'all' || filterStartDate !== '' || filterEndDate !== '';

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Action Bar Component
  const renderActions = (
    <div className="flex flex-col xl:flex-row gap-2 w-full xl:w-auto items-start xl:items-center">
        {isExpanded ? (
          <>
            {/* Search Input */}
            <div className="relative w-full xl:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full xl:w-32 placeholder-slate-600"
                />
            </div>

            <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
                {/* Win/Loss Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="all">Resultado: Todos</option>
                    <option value="winners">Solo Ganadores</option>
                    <option value="losers">Solo Perdedores</option>
                </select>

                {/* Day of Week Filter */}
                <select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="all">Días: Todos</option>
                    {daysOfWeek.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                </select>

                {/* Date Range Inputs */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1">
                    <input 
                        type="date" 
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="bg-transparent text-slate-200 text-xs focus:outline-none w-24"
                        title="Fecha Inicial"
                    />
                    <span className="text-slate-500">-</span>
                    <input 
                        type="date" 
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="bg-transparent text-slate-200 text-xs focus:outline-none w-24"
                        title="Fecha Final"
                    />
                </div>

                {/* Sort Order Toggle */}
                <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-sm rounded-md px-3 py-1.5 transition-colors"
                    title={sortOrder === 'desc' ? "Orden: Más recientes primero" : "Orden: Más antiguos primero"}
                >
                    {sortOrder === 'desc' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
                    )}
                </button>

                {/* Export Filtered Notes Button */}
                {sortedEntries.length > 0 && (
                    <button
                        onClick={handleExportNotes}
                        className="flex items-center justify-center gap-1 bg-blue-900/30 border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-800 text-xs rounded-md px-3 py-1.5 transition-colors"
                        title="Descargar notas filtradas en .txt"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        TXT
                    </button>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center justify-center gap-1 bg-rose-900/30 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-800 text-xs rounded-md px-3 py-1.5 transition-colors"
                        title="Limpiar todos los filtros"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Limpiar
                    </button>
                )}
            </div>
          </>
        ) : null}

        {/* Toggle Button */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors bg-slate-900 p-1.5 rounded-lg border border-slate-700"
            title={isExpanded ? "Colapsar panel" : "Desplegar panel"}
        >
            <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </div>
  );

  if (rawJournalEntries.length === 0) {
    return (
        <Card title="Diario Psicológico y Operativo">
            <div className="text-center py-8 px-4 text-slate-500 italic bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <p>Aún no has escrito notas.</p>
                <p className="text-sm mt-1">Usa el campo "Notas / Lecciones" al registrar tu día para ver tu bitácora mental aquí.</p>
            </div>
        </Card>
    );
  }

  return (
    <Card title="Diario Psicológico y Operativo" action={renderActions}>
      {isExpanded ? (
          <div className="flex flex-col min-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-4 flex-1">
                
                {sortedEntries.length === 0 && (
                    <div className="text-center py-10 text-slate-500 italic">
                        No se encontraron notas con esos filtros.
                    </div>
                )}

                {currentItems.map((day) => {
                const isWin = day.plDailyDollar >= 0;
                const borderColor = isWin ? 'border-l-emerald-500' : 'border-l-rose-500';
                const titleColor = isWin ? 'text-emerald-400' : 'text-rose-400';
                
                // Get Day Name
                const [y, m, d] = day.date.split('-').map(Number);
                const dateObj = new Date(y, m - 1, d);
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

                return (
                    <div key={day.id} className={`bg-slate-900/50 border border-slate-700 rounded-r-lg border-l-4 ${borderColor} p-4 shadow-sm hover:bg-slate-800/80 transition-colors`}>
                    {/* Header: Date & Result */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-slate-200 font-bold text-lg">{day.date}</span>
                            <span className="text-slate-400 text-sm hidden sm:inline">|</span>
                            <span className="text-slate-400 text-sm">{capitalizedDay}</span>
                            <span className="text-slate-400 text-sm hidden sm:inline">|</span>
                            <span className="text-slate-400 text-sm">
                                <span className="text-blue-400 font-bold">{day.tradeCount || 0}</span> Ops
                            </span>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-medium ${titleColor}`}>
                                {isWin ? '+' : ''}{formatCurrency(day.plDailyDollar)} 
                                <span className="text-xs ml-1 opacity-80">({formatPercent(day.plDailyPercent)})</span>
                            </div>
                        </div>
                    </div>

                    {/* Note Content */}
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-light text-sm md:text-base">
                        {day.notes}
                    </div>
                    </div>
                );
                })}
            </div>

            {/* Pagination Footer */}
            {sortedEntries.length > 0 && (
                <div className="border-t border-slate-700 pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">Mostrar</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1); // Reset to page 1
                            }}
                            className="bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-slate-400">notas</span>
                    </div>
                    
                    <div className="text-sm text-slate-400 text-center">
                        Mostrando <span className="font-medium text-slate-200">{startRange}</span> - <span className="font-medium text-slate-200">{endRange}</span> de <span className="font-medium text-slate-200">{sortedEntries.length}</span>
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded transition-colors ${
                            currentPage === 1 
                                ? 'text-slate-600 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-2 rounded transition-colors ${
                            currentPage === totalPages || totalPages === 0
                                ? 'text-slate-600 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
          </div>
      ) : (
        <div className="text-center text-slate-500 text-sm italic py-2 cursor-pointer" onClick={() => setIsExpanded(true)}>
            Haz clic para abrir el panel.
        </div>
      )}
    </Card>
  );
};
