
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
  
  // Track Net Invested Capital for accurate ROI (Initial + Deposits - Withdrawals)
  let runningNetInvested = config.totalInitialCapital; 

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

    // --- 1. Determine Previous Day Closing Capital ---
    let prevClosing = config.totalInitialCapital;
    if (index > 0) {
        prevClosing = sorted[index - 1].finalCapital;
    }

    // --- 2. Handle Cash Flow (Deposits/Withdrawals) ---
    const deposit = entry.deposit || 0;
    const withdrawal = entry.withdrawal || 0;
    
    // Adjusted Start Capital for the day = Previous Close + Net Flow
    const initialCapitalDaily = prevClosing + deposit - withdrawal;

    // Update running invested capital
    runningNetInvested += (deposit - withdrawal);

    // --- 3. Determine Month Start Capital (Legacy override support + logic) ---
    // Note: With the new cash flow logic, monthly overrides are less critical but kept for compatibility
    let monthStart = config.monthlyStartCapitals[monthKey];
    if (monthStart === undefined) {
      // Find the last entry of the previous month
      const prevMonthEntries = calculated.filter(c => c.monthId < monthKey);
      if (prevMonthEntries.length > 0) {
        monthStart = prevMonthEntries[prevMonthEntries.length - 1].finalCapital;
      } else {
        monthStart = config.totalInitialCapital;
      }
    }

    // --- 4. Daily Calculations ---
    // P/L is the difference between Final Capital and what we started with (after adjustments)
    const plDailyDollar = entry.finalCapital - initialCapitalDaily;
    const plDailyPercent = initialCapitalDaily !== 0 ? (plDailyDollar / initialCapitalDaily) * 100 : 0;

    // --- 5. Week To Date Logic ---
    if (weekId !== currentWeekId) {
        currentWeekId = weekId;
        weekPLAccum = 0;
        // The start capital for the week is the initial capital of this day (first day of week)
        weekStartCapital = initialCapitalDaily;
    }
    weekPLAccum += plDailyDollar;
    const plWeekPercent = weekStartCapital !== 0 ? (weekPLAccum / weekStartCapital) * 100 : 0;

    // --- 6. Accumulate Total P/L ---
    totalPLAccum += plDailyDollar;
    
    if (!monthPLAccum[monthKey]) monthPLAccum[monthKey] = 0;
    monthPLAccum[monthKey] += plDailyDollar;

    // Month To Date P/L
    const plMonthDollar = monthPLAccum[monthKey];
    // Month percent: We try to use monthStart, but if cash flow happened mid-month, this is approximate. 
    // For strict accuracy, one would track monthStart adjusted by flows. 
    // For simplicity, we keep using the static monthStart or dynamically updated base.
    const plMonthPercent = monthStart !== 0 ? (plMonthDollar / monthStart) * 100 : 0;

    // Total To Date P/L (This is PURE Trading Performance)
    const plTotalDollar = totalPLAccum;
    // ROI based on Net Invested Capital
    const plTotalPercent = runningNetInvested !== 0 ? (plTotalDollar / runningNetInvested) * 100 : 0;

    calculated.push({
      id: entry.id,
      date: entry.date,
      finalCapital: entry.finalCapital,
      initialCapitalDaily, 
      deposit,
      withdrawal,
      tradeCount: entry.tradeCount !== undefined ? entry.tradeCount : 0, 
      notes: entry.notes || '',
      plDailyDollar,
      plDailyPercent,
      
      plWeekToDateDollar: weekPLAccum,
      plWeekToDatePercent: plWeekPercent,

      initialCapitalMonthly: monthStart,
      plMonthToDateDollar: plMonthDollar,
      plMonthToDatePercent: plMonthPercent,
      
      // We store the running invested capital as the "Total Initial" basis for this point in time
      initialCapitalTotal: runningNetInvested, 
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
    // Sort ascending to find first and last day
    const days = groups[key].sort((a, b) => a.date.localeCompare(b.date));
    
    const plDollar = days.reduce((sum, d) => sum + d.plDailyDollar, 0);
    const startCapital = days[0].initialCapitalDaily; 
    const endCapital = days[days.length - 1].finalCapital;

    const plPercent = startCapital !== 0 ? (plDollar / startCapital) * 100 : 0;
    const wins = days.filter(d => d.plDailyDollar > 0).length;
    const totalOps = days.reduce((sum, d) => sum + (d.tradeCount || 0), 0);
    
    // Aggregations
    const totalDeposits = days.reduce((sum, d) => sum + (d.deposit || 0), 0);
    const totalWithdrawals = days.reduce((sum, d) => sum + (d.withdrawal || 0), 0);

    return {
      periodId: key,
      label: key,
      plDollar,
      plPercent,
      winRate: (wins / days.length) * 100,
      tradeCount: days.length, // This represents number of days recorded
      totalOperations: totalOps,
      totalDeposits,
      totalWithdrawals,
      startCapital,
      endCapital
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
      totalDeposits: 0, totalWithdrawals: 0, netCashFlow: 0,
      startDate: '-', durationWeeks: 0, durationMonths: 0, durationYears: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0,
      winningDays: 0, losingDays: 0, winRate: 0,
      totalTrades: 0, avgTradesPerDay: 0, avgTradesPerWeek: 0, avgTradesPerMonth: 0, maxTradesPerDay: 0,
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

  // Days are in descending order (Newest first). 
  // Get chronological order for streak calc and Date calc
  const chronDays = [...days].reverse();

  // Cash Flow Totals
  const totalDeposits = days.reduce((sum, d) => sum + (d.deposit || 0), 0);
  const totalWithdrawals = days.reduce((sum, d) => sum + (d.withdrawal || 0), 0);
  const netCashFlow = totalDeposits - totalWithdrawals;

  // --- Duration Calculation ---
  const firstDate = new Date(chronDays[0].date);
  const lastDate = new Date(chronDays[chronDays.length - 1].date);
  
  // Diff in milliseconds
  const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
  // Diff in days (Calendar days, not trading days)
  const diffCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include first day

  const durationWeeks = Math.max(0, (diffCalendarDays / 7));
  const durationMonths = Math.max(0, (diffCalendarDays / 30.44)); // Avg days per month
  const durationYears = Math.max(0, (diffCalendarDays / 365.25));

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;
  let totalTrades = 0;
  let maxTradesPerDay = 0;

  chronDays.forEach(day => {
    // Accumulate trades
    const trades = day.tradeCount || 0;
    totalTrades += trades;
    
    if (trades > maxTradesPerDay) {
        maxTradesPerDay = trades;
    }

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

  // Avg Trades Calculation
  const avgTradesPerDay = days.length > 0 ? totalTrades / days.length : 0;
  const avgTradesPerWeek = weeklySummaries.length > 0 ? totalTrades / weeklySummaries.length : 0;
  const avgTradesPerMonth = monthlySummaries.length > 0 ? totalTrades / monthlySummaries.length : 0;

  return {
    currentCapital: newestDay.finalCapital,
    // totalInitialCapital now reflects the NET INVESTED CAPITAL (Initial + Flows)
    totalInitialCapital: newestDay.initialCapitalTotal,
    totalPLDollar: newestDay.plTotalToDateDollar,
    totalPLPercent: newestDay.plTotalToDatePercent,
    
    totalDeposits,
    totalWithdrawals,
    netCashFlow,

    // Duration
    startDate: chronDays[0].date,
    durationWeeks,
    durationMonths,
    durationYears,

    maxConsecutiveWins,
    maxConsecutiveLosses,
    winningDays: winners.length,
    losingDays: losers.length,
    winRate: (winners.length / days.length) * 100,
    totalTrades,
    avgTradesPerDay,
    avgTradesPerWeek,
    avgTradesPerMonth,
    maxTradesPerDay,
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
