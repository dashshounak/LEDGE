import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, DollarSign, Tag, TrendingUp } from "lucide-react";
import { Category, Budget } from "../types";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Partial<Budget>) => Promise<void>;
  categories: Category[];
  budgetToEdit?: Budget | null;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  categories,
  budgetToEdit,
}: BudgetModalProps) {
  const [limit, setLimit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [month, setMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Default month to current July 2026 or current calendar month
    const today = new Date();
    // Default to '2026-07' as standard in this sandbox, or actual system month
    const defaultMonth = "2026-07";

    if (budgetToEdit) {
      setLimit(budgetToEdit.limit.toString());
      setCategoryId(budgetToEdit.categoryId);
      setMonth(budgetToEdit.month);
    } else {
      setLimit("");
      setCategoryId(categories[0]?.id || "global");
      setMonth(defaultMonth);
    }
    setError("");
  }, [budgetToEdit, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setError("Please enter a valid budget limit (0 or more).");
      return;
    }

    if (!categoryId) {
      setError("Please select a target category.");
      return;
    }

    if (!month) {
      setError("Please select a target month.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: budgetToEdit?.id,
        month,
        categoryId,
        limit: parsedLimit,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save budget limit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs"
            id="modal-backdrop-budget"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden border-4 border-black bg-white brutalist-shadow-lg z-10"
            id="budget-modal-container"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black px-6 py-4 bg-neutral-100">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-tight" id="budget-modal-title">
                {budgetToEdit ? "Edit Budget Limit" : "Set Category Budget"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-black bg-white p-1 hover:bg-neutral-100 text-black transition cursor-pointer"
                id="close-budget-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5" id="budget-modal-form">
              {error && (
                <div className="border-2 border-red-700 bg-red-100 text-red-700 font-mono font-bold uppercase p-3 text-xs" id="budget-modal-error">
                  {error}
                </div>
              )}

              {/* Month Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Target Month *
                </label>
                <input
                  type="month"
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2.5 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white"
                  id="budget-month-input"
                />
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block pl-1">
                  Budget allocations are separated by month.
                </span>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Target Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border-2 border-black px-3.5 py-2.5 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white"
                  id="budget-category-select"
                >
                  <option value="global">GLOBAL TOTAL BUDGET</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Budget Limit ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-black font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 500"
                    required
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full border-2 border-black py-2.5 pl-8 pr-4 text-xs font-mono font-bold uppercase placeholder-neutral-500 focus:bg-yellow-50 focus:outline-hidden bg-white"
                    id="budget-limit-input"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border-2 border-black bg-white hover:bg-neutral-100 text-xs font-black uppercase tracking-wider cursor-pointer"
                  id="cancel-budget-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400 text-xs font-black uppercase tracking-wider brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                  id="save-budget-btn"
                >
                  {isSubmitting ? "Saving..." : budgetToEdit ? "Update Budget" : "Set Budget Limit"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
