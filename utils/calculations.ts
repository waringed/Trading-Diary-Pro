import { TradeEntry, AppConfig, CalculatedDay, GlobalStats, PeriodSummary } from '../types';

// Helper to get ISO Week Label (Monday to Friday)
function getWeekLabel(dateObj: Date): string {
  // Clone to avoid mutation
  const d = new Date(dateObj);
  // Adjust to closest Monday (if Sunday (0), go back 6 days. If Mon-Sat, go back day-1)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const format = (dt: Date) => `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
  return `Semana ${format(monday)} - ${format(friday)}`;
}

export const processEntries = (entries: TradeEntry[], config: AppConfig): CalculatedDay[] => {
  // Sort entries by date ascending
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  const calculated: CalculatedDay[] = [];
  
  let totalPLAccum = 0;
  const monthPLAccum: Record<string, number> = {};
  
  // Weekly Calculation State
  let currentWeekId = '';
  let weekPLAccum = 0;
  let weekStartCapital = 0;

  sorted.forEach((entry, index) => {
    const dateObj = new Date(entry.date);
    // Fix for timezone issues
    const [y, m, d] = entry.date.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);

    const dateStr = entry.date;
    const monthKey = dateStr.substring(0, 7); // YYYY-MM
    const yearStr = dateStr.substring(0, 4);
    const weekId = getWeekLabel(localDate);
    const quarter = Math.floor((localDate.getMonth() + 3) / 3);
    const quarterId = `${yearStr}-Q${quarter}`;

    // 1. Determine Previous Day Capital (Daily Initial)
    let prevFinal = config.totalInitialCapital;
    let isManual = false;

    if (entry.initialCapital !== undefined && entry.initialCapital !== null && !isNaN(entry.initialCapital)) {
        prevFinal = entry.initialCapital;
        isManual = true;
    } else if (index > 0) {
        prevFinal = sorted[index - 1].finalCapital;
    }

    // 2. Determine Month Start Capital
    let monthStart = config.monthlyStartCapitals[monthKey];
    if (monthStart === undefined) {
      const prevMonthEntries = calculated.filter(c => c.monthId < monthKey);
      if (prevMonthEntries.length > 0) {
        monthStart = prevMonthEntries[prevMonthEntries.length - 1].finalCapital;
      } else {
        monthStart = config.totalInitialCapital;
      }
    }

    // Daily Calculations
    const plDailyDollar = entry.finalCapital - prevFinal;
    const plDailyPercent = prevFinal !== 0 ? (plDailyDollar / prevFinal) * 100 : 0;

    // Week To Date Logic
    if (weekId !== currentWeekId) {
        currentWeekId = weekId;
        weekPLAccum = 0;
        // The start capital for the week is the initial capital of the first entry in that week
        weekStartCapital = prevFinal;
    }
    weekPLAccum += plDailyDollar;
    const plWeekPercent = weekStartCapital !== 0 ? (weekPLAccum / weekStartCapital) * 100 : 0;

    // Accumulate Total P/L
    totalPLAccum += plDailyDollar;
    
    if (!monthPLAccum[monthKey]) monthPLAccum[monthKey] = 0;
    monthPLAccum[monthKey] += plDailyDollar;

    // Month To Date P/L
    const plMonthDollar = monthPLAccum[monthKey];
    const plMonthPercent = monthStart !== 0 ? (plMonthDollar / monthStart) * 100 : 0;

    // Total To Date P/L
    const plTotalDollar = totalPLAccum;
    const plTotalPercent = config.totalInitialCapital !== 0 ? (plTotalDollar / config.totalInitialCapital) * 100 : 0;

    calculated.push({
      id: entry.id,
      date: entry.date,
      finalCapital: entry.finalCapital,
      initialCapitalDaily: prevFinal,
      isManualInitial: isManual,
      plDailyDollar,
      plDailyPercent,
      
      plWeekToDateDollar: weekPLAccum,
      plWeekToDatePercent: plWeekPercent,

      initialCapitalMonthly: monthStart,
      plMonthToDateDollar: plMonthDollar,
      plMonthToDatePercent: plMonthPercent,
      initialCapitalTotal: config.totalInitialCapital,
      plTotalToDateDollar: plTotalDollar,
      plTotalToDatePercent: plTotalPercent,
      weekId,
      monthId: monthKey,
      quarterId,
      yearId: yearStr,
    });
  });

  return calculated.reverse(); // Return descending
};

export const calculatePeriodSummaries = (calculated: CalculatedDay[], periodKey: keyof CalculatedDay): PeriodSummary[] => {
  const groups: Record<string, CalculatedDay[]> = {};
  calculated.forEach(day => {
    const key = String(day[periodKey]);
    if (!groups[key]) groups[key] = [];
    groups[key].push(day);
  });

  const summaries: PeriodSummary[] = Object.keys(groups).map(key => {
    const days = groups[key].sort((a, b) => a.date.localeCompare(b.date));
    const plDollar = days.reduce((sum, d) => sum + d.plDailyDollar, 0);
    const startCapital = days[0].initialCapitalDaily; 
    const plPercent = startCapital !== 0 ? (plDollar / startCapital) * 100 : 0;
    const wins = days.filter(d => d.plDailyDollar > 0).length;

    return {
      periodId: key,
      label: key,
      plDollar,
      plPercent,
      winRate: (wins / days.length) * 100,
      tradeCount: days.length
    };
  });

  return summaries.sort((a, b) => {
      const groupA = groups[a.periodId];
      const groupB = groups[b.periodId];
      if (!groupA || !groupB) return 0;
      return groupB[0].date.localeCompare(groupA[0].date);
  });
};

export const calculateGlobalStats = (days: CalculatedDay[], weeklySummaries: PeriodSummary[], monthlySummaries: PeriodSummary[]): GlobalStats => {
  if (days.length === 0) {
    return {
      currentCapital: 0, totalInitialCapital: 0, totalPLDollar: 0, totalPLPercent: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0,
      winningDays: 0, losingDays: 0, winRate: 0,
      avgWinDailyDollar: 0, avgWinDailyPercent: 0,
      avgLossDailyDollar: 0, avgLossDailyPercent: 0,
      avgWinWeeklyDollar: 0, avgWinWeeklyPercent: 0,
      avgLossWeeklyDollar: 0, avgLossWeeklyPercent: 0,
      avgWinMonthlyDollar: 0, avgWinMonthlyPercent: 0,
      avgLossMonthlyDollar: 0, avgLossMonthlyPercent: 0,
      maxWinDailyDollar: 0, maxWinDailyPercent: 0,
      maxLossDailyDollar: 0, maxLossDailyPercent: 0,
      avgGeneralDollar: 0, avgGeneralPercent: 0
    };
  }

  // Days are in descending order (Newest first), we need chronological for streaks
  const chronDays = [...days].reverse();

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;

  chronDays.forEach(day => {
    if (day.plDailyDollar > 0) {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
    } else if (day.plDailyDollar < 0) {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
    } else {
        // Flat day breaks both streaks
        currentWins = 0;
        currentLosses = 0;
    }
  });

  const newestDay = days[0];

  const winners = days.filter(d => d.plDailyDollar > 0);
  const losers = days.filter(d => d.plDailyDollar <= 0);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgGeneralDollar = avg(days.map(d => d.plDailyDollar));
  const avgGeneralPercent = avg(days.map(d => d.plDailyPercent));

  const avgWinDailyDollar = avg(winners.map(d => d.plDailyDollar));
  const avgWinDailyPercent = avg(winners.map(d => d.plDailyPercent));
  const avgLossDailyDollar = avg(losers.map(d => d.plDailyDollar));
  const avgLossDailyPercent = avg(losers.map(d => d.plDailyPercent));

  const maxWinDailyDollar = Math.max(...days.map(d => d.plDailyDollar));
  const maxWinDailyPercent = Math.max(...days.map(d => d.plDailyPercent));
  const maxLossDailyDollar = Math.min(...days.map(d => d.plDailyDollar));
  const maxLossDailyPercent = Math.min(...days.map(d => d.plDailyPercent));

  const winningWeeks = weeklySummaries.filter(w => w.plDollar > 0);
  const losingWeeks = weeklySummaries.filter(w => w.plDollar <= 0);
  
  const avgWinWeeklyDollar = avg(winningWeeks.map(w => w.plDollar));
  const avgWinWeeklyPercent = avg(winningWeeks.map(w => w.plPercent));
  const avgLossWeeklyDollar = avg(losingWeeks.map(w => w.plDollar));
  const avgLossWeeklyPercent = avg(losingWeeks.map(w => w.plPercent));

  const winningMonths = monthlySummaries.filter(m => m.plDollar > 0);
  const losingMonths = monthlySummaries.filter(m => m.plDollar <= 0);

  const avgWinMonthlyDollar = avg(winningMonths.map(m => m.plDollar));
  const avgWinMonthlyPercent = avg(winningMonths.map(m => m.plPercent));
  const avgLossMonthlyDollar = avg(losingMonths.map(m => m.plDollar));
  const avgLossMonthlyPercent = avg(losingMonths.map(m => m.plPercent));

  return {
    currentCapital: newestDay.finalCapital,
    totalInitialCapital: newestDay.initialCapitalTotal,
    totalPLDollar: newestDay.plTotalToDateDollar,
    totalPLPercent: newestDay.plTotalToDatePercent,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    winningDays: winners.length,
    losingDays: losers.length,
    winRate: (winners.length / days.length) * 100,
    avgWinDailyDollar, avgWinDailyPercent,
    avgLossDailyDollar, avgLossDailyPercent,
    avgWinWeeklyDollar, avgWinWeeklyPercent,
    avgLossWeeklyDollar, avgLossWeeklyPercent,
    avgWinMonthlyDollar, avgWinMonthlyPercent,
    avgLossMonthlyDollar, avgLossMonthlyPercent,
    maxWinDailyDollar, maxWinDailyPercent,
    maxLossDailyDollar, maxLossDailyPercent,
    avgGeneralDollar, avgGeneralPercent
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(val);
};

export const formatPercent = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val / 100);
};