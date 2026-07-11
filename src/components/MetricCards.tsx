import React, { useState } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Edit2, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { FinanceData } from "../types";

interface MetricCardsProps {
  data: FinanceData;
  activeMonth: string; // YYYY-MM
  onUpdateIncome: (income: number) => Promise<void>;
}

export default function MetricCards({ data, activeMonth, onUpdateIncome }: MetricCardsProps) {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState(data.userPreferences.monthlyIncome.toString());
  const [isSaving, setIsSaving] = useState(false);

  const currencySymbol = data.userPreferences.currency === "USD" ? "$" : data.userPreferences.currency;

  // Filter expenses and budgets for active month
  const monthExpenses = data.expenses.filter((e) => e.date.startsWith(activeMonth));
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const income = data.userPreferences.monthlyIncome;
  const remaining = income - totalSpent;

  // Calculate budget statistics
  const monthBudgets = data.budgets.filter((b) => b.month === activeMonth);
  const globalBudget = monthBudgets.find((b) => b.categoryId === "global")?.limit || income;

  // Category specific budget alerts
  const budgetAlerts = monthBudgets
    .filter((b) => b.categoryId !== "global")
    .map((budget) => {
      const category = data.categories.find((c) => c.id === budget.categoryId);
      const catExpenses = monthExpenses.filter((e) => e.categoryId === budget.categoryId);
      const catSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percent = budget.limit > 0 ? (catSpent / budget.limit) * 100 : 0;
      return {
        categoryName: category?.name || "Unknown",
        color: category?.color || "#3b82f6",
        spent: catSpent,
        limit: budget.limit,
        percent,
      };
    })
    .filter((item) => item.percent >= 90);

  const handleSaveIncome = async () => {
    const val = parseFloat(newIncome);
    if (!isNaN(val) && val >= 0) {
      setIsSaving(true);
      try {
        await onUpdateIncome(val);
        setIsEditingIncome(false);
      } catch (err) {
        console.error("Failed to update income", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6" id="metrics-root">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="metrics-grid">
        {/* Card 1: Monthly Income */}
        <div className="bg-white p-6 border-4 border-black brutalist-shadow flex flex-col justify-between" id="metric-income-card">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-1.5 bg-black text-white border-2 border-black">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-4">
            {isEditingIncome ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black font-mono text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={newIncome}
                    onChange={(e) => setNewIncome(e.target.value)}
                    className="w-full border-2 border-black py-1.5 pl-6 pr-1.5 text-sm font-mono font-bold focus:bg-yellow-50 focus:outline-hidden"
                    autoFocus
                    id="edit-income-input"
                  />
                </div>
                <button
                  onClick={handleSaveIncome}
                  disabled={isSaving}
                  className="p-2 bg-[#10b981] text-white border-2 border-black font-black brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                  id="save-income-btn"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-display text-black tracking-tighter" id="income-value">
                  {currencySymbol}
                  {income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => {
                    setNewIncome(income.toString());
                    setIsEditingIncome(true);
                  }}
                  className="p-1.5 border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400 brutalist-shadow-sm transition-all text-xs font-bold"
                  id="edit-income-toggle-btn"
                  title="Edit Income"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <span className="text-[11px] font-mono text-neutral-600 mt-3 block">
            BASELINE CASHFLOW ENGINE
          </span>
        </div>

        {/* Card 2: Total Spent */}
        <div className="bg-white p-6 border-4 border-black brutalist-shadow flex flex-col justify-between" id="metric-spent-card">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Total Spent
            </span>
            <div className="p-1.5 bg-black text-white border-2 border-black">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-display text-black tracking-tighter" id="spent-value">
              {currencySymbol}
              {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-neutral-600 flex items-center gap-1.5">
            <span>PERIOD:</span>
            <span className="font-mono bg-black text-white px-2 py-0.5 text-[10px] font-bold">{activeMonth}</span>
          </div>
        </div>

        {/* Card 3: Remaining Funds */}
        <div className={`p-6 border-4 border-black brutalist-shadow flex flex-col justify-between transition-colors ${
          remaining < 0 ? "bg-red-100" : "bg-emerald-50"
        }`} id="metric-remaining-card">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Remaining Balance
            </span>
            <div className={`p-1.5 border-2 border-black text-white ${remaining < 0 ? "bg-red-600" : "bg-emerald-600"}`}>
              {remaining < 0 ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownRight className="h-4.5 w-4.5" />}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-black font-display tracking-tighter ${remaining < 0 ? "text-red-700" : "text-emerald-800"}`} id="remaining-value">
              {remaining < 0 ? "-" : ""}
              {currencySymbol}
              {Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 text-[11px] font-mono font-bold">
            {remaining < 0 ? (
              <span className="text-red-700 flex items-center gap-1 uppercase tracking-tight">
                <AlertTriangle className="h-3.5 w-3.5" /> OUT OF BOUNDS
              </span>
            ) : (
              <span className="text-emerald-800 uppercase tracking-tight">SURPLUS TO PLAN</span>
            )}
          </div>
        </div>

        {/* Card 4: Active Budgets count */}
        <div className="bg-white p-6 border-4 border-black brutalist-shadow flex flex-col justify-between" id="metric-budgets-card">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Budget Rules
            </span>
            <div className="p-1.5 bg-black text-white border-2 border-black">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-display text-black tracking-tighter" id="budgets-count-value">
              {monthBudgets.length}
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-600 mt-3 block">
            ACTIVE GUARDRAILS
          </span>
        </div>
      </div>

      {/* Visual Alerts Drawer/Panel for 90%+ Budget Usage */}
      {budgetAlerts.length > 0 && (
        <div className="border-4 border-black bg-amber-100 p-5 brutalist-shadow" id="budget-alerts-container">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-400 text-black border-2 border-black font-black mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-base font-black text-black uppercase tracking-tight font-display">
                BUDGET ALERT: APPROACHING LIMIT
              </h4>
              <p className="text-xs text-neutral-800 font-medium">
                The following categories have consumed 90% or more of their monthly allowances:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {budgetAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 border-2 border-black brutalist-shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-black flex items-center gap-2">
                        <span
                          className="h-3 w-3 border border-black inline-block"
                          style={{ backgroundColor: alert.color }}
                        />
                        {alert.categoryName}
                      </span>
                      <span className={`font-mono font-black px-1.5 py-0.5 border border-black ${alert.percent >= 100 ? "bg-red-500 text-white" : "bg-yellow-300 text-black"}`}>
                        {Math.round(alert.percent)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-neutral-100 border border-black overflow-hidden">
                      <div
                        className={`h-full border-r border-black transition-all duration-300 ${
                          alert.percent >= 100 ? "bg-red-500" : "bg-yellow-400"
                        }`}
                        style={{ width: `${Math.min(alert.percent, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-neutral-700">
                      <span>SPENT: ${alert.spent.toFixed(2)}</span>
                      <span>LIMIT: ${alert.limit.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
