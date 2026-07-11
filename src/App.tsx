import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  DollarSign,
  TrendingUp,
  Tag,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
} from "lucide-react";
import { FinanceData, Expense, Budget, Category } from "./types";
import MetricCards from "./components/MetricCards";
import DashboardCharts from "./components/DashboardCharts";
import ExpenseList from "./components/ExpenseList";
import CategorySettings from "./components/CategorySettings";
import ExpenseModal from "./components/ExpenseModal";
import BudgetModal from "./components/BudgetModal";

export default function App() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month state defaults to July 2026 to showcase our mock datasets
  const [activeMonth, setActiveMonth] = useState("2026-07");

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  // Load finance state on mount
  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance");
      if (!res.ok) {
        throw new Error("HTTP status " + res.status);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load finance data", err);
      setError("Unable to connect to financial server. Please ensure the server is running correctly.");
    } finally {
      setLoading(false);
    }
  };

  // Preference Handlers
  const handleUpdateIncome = async (income: number) => {
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyIncome: income }),
      });
      if (!res.ok) throw new Error("Failed to save income preference");
      const updatedPreferences = await res.json();
      setData((prev) => prev ? { ...prev, userPreferences: { ...prev.userPreferences, monthlyIncome: income } } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateCurrency = async (currency: string) => {
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      if (!res.ok) throw new Error("Failed to save currency preference");
      setData((prev) => prev ? { ...prev, userPreferences: { ...prev.userPreferences, currency } } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Category Handlers
  const handleAddCategory = async (cat: { name: string; color: string }) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to add category");
      }
      const categories: Category[] = await res.json();
      setData((prev) => prev ? { ...prev, categories } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This reassigns all expenses in this category to 'Others' and removes its budgets.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      const fullState: FinanceData = await res.json();
      setData(fullState);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Expense Handlers
  const handleSaveExpense = async (expense: Partial<Expense>) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to save transaction");
      }
      const expenses: Expense[] = await res.json();
      setData((prev) => prev ? { ...prev, expenses } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
      throw err;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction permanently?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      const expenses: Expense[] = await res.json();
      setData((prev) => prev ? { ...prev, expenses } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Budget Handlers
  const handleSaveBudget = async (budget: Partial<Budget>) => {
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to save budget limit");
      }
      const budgets: Budget[] = await res.json();
      setData((prev) => prev ? { ...prev, budgets } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
      throw err;
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm("Remove this budget limit allocation?")) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete budget limit");
      const budgets: Budget[] = await res.json();
      setData((prev) => prev ? { ...prev, budgets } : null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Navigation Month Helpers
  const handlePrevMonth = () => {
    const [y, m] = activeMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, "0");
    setActiveMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = activeMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, "0");
    setActiveMonth(`${nextY}-${nextM}`);
  };

  const getMonthLabel = (ymStr: string) => {
    const [y, m] = ymStr.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  };

  // Loading Screen
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]" id="loading-screen">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-black border-t-yellow-300 rounded-full animate-spin mx-auto" />
          <h2 className="font-display text-lg font-black uppercase text-black">Loading ledger state...</h2>
          <p className="text-xs font-mono font-bold uppercase text-neutral-500">Restoring finance_db.json configurations</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] p-4" id="error-screen">
        <div className="max-w-md w-full bg-white border-4 border-black brutalist-shadow p-6 text-center space-y-5">
          <div className="p-3 bg-red-100 border-2 border-black inline-block">
            <AlertCircle className="h-8 w-8 text-black" />
          </div>
          <h2 className="font-display text-xl font-black uppercase text-black">Connection Offline</h2>
          <p className="text-xs font-mono font-bold text-neutral-600 leading-relaxed uppercase">{error}</p>
          <button
            onClick={fetchFinanceData}
            className="w-full bg-yellow-300 text-black border-2 border-black font-black uppercase hover:bg-yellow-400 py-3 text-xs tracking-wider brutalist-shadow cursor-pointer transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-16 font-sans text-black" id="app-root">
      {/* Top Banner / Navigation header */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-40" id="header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-300 border-4 border-black flex items-center justify-center text-black brutalist-shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-black uppercase tracking-tight leading-none">
                  Ledge
                </h1>
                <span className="bg-black text-white text-[10px] font-mono font-bold border border-black px-2 py-0.5 uppercase tracking-wider">
                  JSON Store
                </span>
              </div>
              <p className="text-[11px] font-mono font-bold text-neutral-600 uppercase tracking-wider mt-1.5">
                Zero-config Personal Finance Ledger &amp; Budget Manager
              </p>
            </div>
          </div>

          {/* Nav Actions: Month selection & Settings info */}
          <div className="flex flex-wrap items-center gap-3" id="top-bar-controls">
            {/* Arrow Month navigation switcher */}
            <div className="flex items-center bg-white border-2 border-black p-1 brutalist-shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 border border-black bg-white text-black hover:bg-yellow-300 transition-colors cursor-pointer"
                id="prev-month-btn"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-black uppercase text-black px-4 min-w-36 text-center font-display" id="active-month-label">
                {getMonthLabel(activeMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 border border-black bg-white text-black hover:bg-yellow-300 transition-colors cursor-pointer"
                id="next-month-btn"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Currency settings dropdown */}
            <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 brutalist-shadow-sm">
              <Settings className="h-4 w-4 text-black" />
              <select
                value={data.userPreferences.currency}
                onChange={(e) => handleUpdateCurrency(e.target.value)}
                className="text-xs font-mono font-black uppercase text-black bg-transparent focus:outline-hidden"
                id="currency-setting-select"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            {/* User profile identifier */}
            <div className="hidden sm:flex items-center gap-2 border-l-2 border-black pl-3">
              <div className="h-10 w-10 border-2 border-black bg-yellow-300 text-black flex items-center justify-center brutalist-shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-mono font-black text-neutral-500 uppercase">Account Owner</p>
                <p className="text-xs font-black text-black max-w-28 truncate" title="naikdasharath1510@gmail.com">
                  naikdasharath1510@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main dashboard content container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8" id="dashboard-main-content">
        {/* Dynamic metrics calculations */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          id="section-metrics"
        >
          <MetricCards
            data={data}
            activeMonth={activeMonth}
            onUpdateIncome={handleUpdateIncome}
          />
        </motion.section>

        {/* Dynamic Charts and Graph visualization container */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          id="section-charts"
        >
          <DashboardCharts data={data} activeMonth={activeMonth} />
        </motion.section>

        {/* Transactions log table section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          id="section-expenses-list"
        >
          <ExpenseList
            expenses={data.expenses}
            categories={data.categories}
            currency={data.userPreferences.currency}
            onAddExpenseClick={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(expense) => {
              setExpenseToEdit(expense);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        </motion.section>

        {/* Categories Directory and Budgets custom controls settings section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          id="section-settings-panels"
        >
          <CategorySettings
            data={data}
            activeMonth={activeMonth}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddBudgetClick={() => {
              setBudgetToEdit(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudgetClick={(budget) => {
              setBudgetToEdit(budget);
              setIsBudgetModalOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
          />
        </motion.section>
      </main>

      {/* Expense Modal (Form to Add/Edit Expense) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleSaveExpense}
        categories={data.categories}
        expenseToEdit={expenseToEdit}
      />

      {/* Budget Modal (Form to Add/Edit Budget Allocation limits) */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setBudgetToEdit(null);
        }}
        onSave={handleSaveBudget}
        categories={data.categories}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
}
