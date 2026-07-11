import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, CreditCard, DollarSign, FileText, Tag } from "lucide-react";
import { Category, Expense } from "../types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => Promise<void>;
  categories: Category[];
  expenseToEdit?: Expense | null;
}

const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "Cash",
  "UPI",
  "Bank Transfer",
];

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  categories,
  expenseToEdit,
}: ExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategoryId(expenseToEdit.categoryId);
      // Format ISO string to YYYY-MM-DD for date input
      const formattedDate = expenseToEdit.date.substring(0, 10);
      setDate(formattedDate);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setDescription(expenseToEdit.description);
    } else {
      setAmount("");
      setCategoryId(categories[0]?.id || "");
      setDate(new Date().toISOString().substring(0, 10));
      setPaymentMethod("Credit Card");
      setDescription("");
    }
    setError("");
  }, [expenseToEdit, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: expenseToEdit?.id,
        amount: parsedAmount,
        categoryId,
        date: new Date(date).toISOString(),
        paymentMethod,
        description,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense.");
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
            id="modal-backdrop-expense"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden border-4 border-black bg-white brutalist-shadow-lg z-10"
            id="expense-modal-container"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black px-6 py-4 bg-neutral-100">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-tight" id="expense-modal-title">
                {expenseToEdit ? "Edit Expense" : "Add Expense"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-black bg-white p-1 hover:bg-neutral-100 text-black transition cursor-pointer"
                id="close-expense-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5" id="expense-modal-form">
              {error && (
                <div className="border-2 border-red-700 bg-red-100 text-red-700 font-mono font-bold uppercase p-3 text-xs" id="expense-modal-error">
                  {error}
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Amount ({categories[0] ? "USD" : ""}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-black font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border-2 border-black py-2.5 pl-8 pr-4 text-xs font-mono font-bold uppercase placeholder-neutral-500 focus:bg-yellow-50 focus:outline-hidden bg-white"
                    id="expense-amount-input"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border-2 border-black px-3.5 py-2.5 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white"
                  id="expense-category-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Date & Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-black uppercase tracking-wider block">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2.5 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white"
                    id="expense-date-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-black uppercase tracking-wider block">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2.5 text-xs font-mono font-bold uppercase focus:bg-yellow-50 focus:outline-hidden bg-white"
                    id="expense-payment-method-select"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-black uppercase tracking-wider block">
                  Description / Merchant
                </label>
                <textarea
                  placeholder="E.G. WHOLE FOODS GROCERIES, UBER TRIP..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-2 border-black px-3.5 py-2 text-xs font-mono font-bold uppercase placeholder-neutral-500 focus:bg-yellow-50 focus:outline-hidden bg-white"
                  id="expense-description-input"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border-2 border-black bg-white hover:bg-neutral-100 text-xs font-black uppercase tracking-wider cursor-pointer"
                  id="cancel-expense-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400 text-xs font-black uppercase tracking-wider brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                  id="save-expense-btn"
                >
                  {isSubmitting ? "Saving..." : expenseToEdit ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
