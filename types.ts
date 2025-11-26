export interface TradeEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  finalCapital: number;
  initialCapital?: number; // Optional manual override
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
  initialCapitalDaily: number;
  isManualInitial?: boolean; // Flag to indicate manual override
  
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
  tradeCount: number;
}

export interface GlobalStats {
  // New Capital & Total Stats
  currentCapital: number;
  totalInitialCapital: number;
  totalPLDollar: number;
  totalPLPercent: number;
  
  // Streaks
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;

  winningDays: number;
  losingDays: number;
  winRate: number;
  
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