
export interface TradeEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  finalCapital: number;
  // initialCapital removed/deprecated in favor of flow calculation, but kept optional for legacy if needed, though logic will prioritize flow.
  initialCapital?: number; 
  deposit?: number; // New: Additions to capital
  withdrawal?: number; // New: Removals from capital
  tradeCount?: number; // Number of trades executed that day
  notes?: string; // Journal notes
}

export interface AppConfig {
  totalInitialCapital: number;
  // Map of "YYYY-MM" -> Starting Capital for that month
  monthlyStartCapitals: Record<string, number>; 
}

export interface CalculatedDay {
  id: string;
  date: string;
  finalCapital: number;
  initialCapitalDaily: number; // The capital started with (Prev Final + Net Flow)
  
  deposit: number;
  withdrawal: number;
  
  tradeCount: number; // Defaults to 0
  notes?: string; // Journal notes
  
  plDailyDollar: number;
  plDailyPercent: number;
  
  // New Weekly P/L properties
  plWeekToDateDollar: number;
  plWeekToDatePercent: number;

  initialCapitalMonthly: number;
  plMonthToDateDollar: number;
  plMonthToDatePercent: number;

  initialCapitalTotal: number;
  plTotalToDateDollar: number;
  plTotalToDatePercent: number;

  weekId: string; // YYYY-Www (Label)
  monthId: string; // YYYY-MM
  quarterId: string; // YYYY-Qx
  yearId: string; // YYYY
}

export interface PeriodSummary {
  periodId: string;
  label: string;
  plDollar: number;
  plPercent: number;
  winRate: number;
  tradeCount: number; // Actually "Day Count" in logic
  totalOperations: number; // Sum of trades in this period
  totalDeposits: number; // New
  totalWithdrawals: number; // New
  startCapital: number; // New: Capital at the start of the first day of period
  endCapital: number; // New: Capital at the end of the last day of period
}

export interface GlobalStats {
  // New Capital & Total Stats
  currentCapital: number;
  totalInitialCapital: number;
  totalPLDollar: number;
  totalPLPercent: number;
  
  // Cash Flow Stats
  totalDeposits: number;
  totalWithdrawals: number;
  netCashFlow: number;

  // Duration & Volume Stats (Updated)
  startDate: string; // First recorded date
  durationWeeks: number;
  durationMonths: number;
  durationYears: number;

  // Streaks
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;

  winningDays: number;
  losingDays: number;
  winRate: number;
  
  // Volume Stats
  totalTrades: number;
  avgTradesPerDay: number;
  avgTradesPerWeek: number; // New
  avgTradesPerMonth: number; // New
  maxTradesPerDay: number; // New

  avgWinDailyDollar: number;
  avgWinDailyPercent: number;
  avgLossDailyDollar: number;
  avgLossDailyPercent: number;

  avgWinWeeklyDollar: number;
  avgWinWeeklyPercent: number;
  avgLossWeeklyDollar: number;
  avgLossWeeklyPercent: number;

  avgWinMonthlyDollar: number;
  avgWinMonthlyPercent: number;
  avgLossMonthlyDollar: number;
  avgLossMonthlyPercent: number;

  maxWinDailyDollar: number;
  maxWinDailyPercent: number;
  maxLossDailyDollar: number;
  maxLossDailyPercent: number;

  avgGeneralDollar: number;
  avgGeneralPercent: number;
}
