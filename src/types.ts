export interface UserPreferences {
  currency: string;
  theme: string;
  monthlyIncome: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Budget {
  id: string;
  month: string; // Format: YYYY-MM
  categoryId: string; // Target category id, or "global" for a global budget
  limit: number;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // ISO string or YYYY-MM-DD
  paymentMethod: string; // Credit Card, Debit Card, Cash, UPI, Bank Transfer, etc.
  description: string;
  createdAt: string;
}

export interface FinanceData {
  userPreferences: UserPreferences;
  categories: Category[];
  budgets: Budget[];
  expenses: Expense[];
}
