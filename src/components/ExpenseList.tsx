import React, { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  Plus,
  TrendingDown,
} from "lucide-react";
import { Category, Expense } from "../types";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => Promise<void>;
  onAddExpenseClick: () => void;
}

type SortField = "date" | "amount" | "description";
type SortOrder = "asc" | "desc";

export default function ExpenseList({
  expenses,
  categories,
  currency,
  onEditExpense,
  onDeleteExpense,
  onAddExpenseClick,
}: ExpenseListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const currencySymbol = currency === "USD" ? "$" : currency;

  // Filter logic
  const filteredExpenses = expenses.filter((exp) => {
    // 1. Description Search
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase());

    // 2. Category Filter
    const matchesCategory = selectedCategory === "all" || exp.categoryId === selectedCategory;

    // 3. Time Filter
    let matchesTime = true;
    const now = new Date("2026-07-10T23:49:07-07:00"); // Use pinned local system time context
    const expDate = new Date(exp.date);

    if (timeFilter === "today") {
      matchesTime = expDate.toDateString() === now.toDateString();
    } else if (timeFilter === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = expDate >= oneWeekAgo && expDate <= now;
    } else if (timeFilter === "month") {
      matchesTime =
        expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Sort logic
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0;
    if (sortField === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortField === "description") {
      comparison = a.description.localeCompare(b.description);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getCategoryDetails = (catId: string) => {
    return categories.find((c) => c.id === catId) || { name: "Others", color: "#6b7280" };
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border-4 border-black brutalist-shadow overflow-hidden" id="expenses-list-card">
      {/* Title section */}
      <div className="px-6 py-5 border-b-4 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-black text-black uppercase tracking-tight" id="transactions-header-title">
            Transactions Log
          </h3>
          <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest mt-1">
            Displaying {sortedExpenses.length} active ledger record{sortedExpenses.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={onAddExpenseClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-300 text-black border-2 border-black hover:bg-yellow-400 font-black text-xs uppercase tracking-wider brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          id="add-expense-quick-btn"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-6 bg-neutral-50 border-b-4 border-black grid grid-cols-1 md:grid-cols-4 gap-4" id="filters-container">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="SEARCH DETAILS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-black pl-9 pr-4 py-2 text-xs font-mono font-bold uppercase placeholder-neutral-500 focus:bg-yellow-50 focus:outline-hidden bg-white transition-colors"
            id="filter-search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border-2 border-black px-3.5 py-2 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white transition-colors"
            id="filter-category-select"
          >
            <option value="all">ALL CATEGORIES</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filter */}
        <div className="flex border-2 border-black bg-black p-0.5" id="filter-time-tabs">
          {(["all", "today", "week", "month"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`flex-1 text-center py-1 font-display text-[10px] font-black uppercase transition-all ${
                timeFilter === filter
                  ? "bg-yellow-300 text-black border border-black"
                  : "text-white hover:text-yellow-300"
              }`}
              id={`time-filter-${filter}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sorters Quick Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSort("date")}
            className={`flex-1 flex items-center justify-center gap-1.5 border-2 px-2 py-1.5 font-display text-xs font-black uppercase transition-all cursor-pointer ${
              sortField === "date"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-neutral-100"
            }`}
            id="sort-date-btn"
          >
            <span>Date</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleSort("amount")}
            className={`flex-1 flex items-center justify-center gap-1.5 border-2 px-2 py-1.5 font-display text-xs font-black uppercase transition-all cursor-pointer ${
              sortField === "amount"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-neutral-100"
            }`}
            id="sort-amount-btn"
          >
            <span>Amount</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="overflow-x-auto" id="expenses-table-container">
        {sortedExpenses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-neutral-50">
            <TrendingDown className="h-10 w-10 text-black mb-2" />
            <p className="text-sm font-black uppercase text-black">No matching logs found</p>
            <p className="text-xs font-mono text-neutral-500 mt-2">
              Adjust filters or add your first transaction.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse" id="expenses-table">
            <thead>
              <tr className="bg-black text-white text-[11px] font-black uppercase tracking-wider border-b border-black">
                <th className="px-6 py-4">Expense Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {sortedExpenses.map((exp) => {
                const cat = getCategoryDetails(exp.categoryId);
                return (
                  <tr key={exp.id} className="hover:bg-neutral-50/50 transition-colors text-sm">
                    {/* Details: description */}
                    <td className="px-6 py-4">
                      <div className="font-black text-black" id={`expense-desc-${exp.id}`}>
                        {exp.description || "Unlabeled Transaction"}
                      </div>
                    </td>

                    {/* Category color badge */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black text-xs font-black uppercase"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: "#000000",
                        }}
                        id={`expense-cat-${exp.id}`}
                      >
                        <span
                          className="h-2 w-2 border border-black inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4 text-black font-mono text-xs font-bold">
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-black" />
                        {exp.paymentMethod.toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-black font-mono text-xs font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-black" />
                        {formatDate(exp.date).toUpperCase()}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-black font-mono text-black text-base">
                      {currencySymbol}
                      {exp.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-2 border-2 border-black bg-white text-black hover:bg-yellow-300 transition-colors brutalist-shadow-sm text-xs font-bold"
                          id={`edit-btn-${exp.id}`}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-2 border-2 border-black bg-white text-black hover:bg-red-500 hover:text-white transition-colors brutalist-shadow-sm text-xs font-bold"
                          id={`delete-btn-${exp.id}`}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
