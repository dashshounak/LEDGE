import React, { useState } from "react";
import { Plus, Trash2, Calendar, Target, Tag, Sparkles, AlertTriangle } from "lucide-react";
import { Category, Budget, FinanceData } from "../types";

interface CategorySettingsProps {
  data: FinanceData;
  activeMonth: string; // YYYY-MM
  onAddCategory: (category: { name: string; color: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddBudgetClick: () => void;
  onEditBudgetClick: (budget: Budget) => void;
  onDeleteBudget: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#4f46e5", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#64748b", // Slate
];

export default function CategorySettings({
  data,
  activeMonth,
  onAddCategory,
  onDeleteCategory,
  onAddBudgetClick,
  onEditBudgetClick,
  onDeleteBudget,
}: CategorySettingsProps) {
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catError, setCatError] = useState("");

  const monthBudgets = data.budgets.filter((b) => b.month === activeMonth);

  const handleAddCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");

    if (!newCatName.trim()) {
      setCatError("Category name cannot be empty.");
      return;
    }

    // Check for duplicate name
    const exists = data.categories.some(
      (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setCatError("A category with this name already exists.");
      return;
    }

    setIsSubmittingCat(true);
    try {
      await onAddCategory({
        name: newCatName.trim(),
        color: selectedColor,
      });
      setNewCatName("");
      // Select next preset color to make it fun
      const nextIndex = (PRESET_COLORS.indexOf(selectedColor) + 1) % PRESET_COLORS.length;
      setSelectedColor(PRESET_COLORS[nextIndex]);
    } catch (err: any) {
      setCatError(err.message || "Failed to create category.");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const getCategoryName = (catId: string) => {
    if (catId === "global") return "Global Total Budget";
    return data.categories.find((c) => c.id === catId)?.name || "Unknown Category";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="settings-panel-container">
      {/* Category Management Block */}
      <div className="bg-white border-4 border-black p-6 brutalist-shadow flex flex-col justify-between" id="categories-management-card">
        <div>
          <h3 className="font-display text-xl font-black text-black uppercase tracking-tight flex items-center gap-2" id="category-settings-title">
            <Tag className="h-5 w-5 text-black" />
            Categories Directory
          </h3>
          <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest mt-1">
            Create or delete custom categories to organize your expenses.
          </p>

          {/* Form to add */}
          <form onSubmit={handleAddCatSubmit} className="mt-5 space-y-4 bg-neutral-50 p-4 border-2 border-black" id="add-category-form">
            <h4 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-black" />
              Add Custom Category
            </h4>

            {catError && (
              <div className="text-[11px] font-mono font-bold uppercase text-red-700 bg-red-100 border-2 border-red-700 p-2.5" id="cat-form-error">
                {catError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  placeholder="E.G. SUBSCRIPTIONS"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2 text-xs font-mono font-bold uppercase placeholder-neutral-500 focus:bg-yellow-50 focus:outline-hidden bg-white"
                  id="new-category-name-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase tracking-wider block">Pick theme color</label>
                <div className="flex flex-wrap gap-1.5 pt-1" id="preset-colors-picker">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-5 w-5 border border-black transition-all cursor-pointer ${
                        selectedColor === color
                          ? "ring-2 ring-black ring-offset-2 scale-110"
                          : "opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmittingCat}
                className="flex items-center gap-1 px-4 py-2 bg-black text-white hover:bg-neutral-800 border-2 border-black font-black text-xs uppercase tracking-wider brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                id="create-category-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Category
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1" id="categories-list">
            {data.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 border-2 border-black hover:bg-neutral-50 transition-all"
                id={`cat-item-${cat.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-4 w-4 border border-black flex-shrink-0 inline-block"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-black text-black uppercase tracking-tight">{cat.name}</span>
                </div>

                {cat.name.toLowerCase() !== "others" && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 border border-black bg-white text-black hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    id={`delete-cat-${cat.id}`}
                    title="Delete Category (Safe assigned to 'Others')"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-50 border-2 border-black flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-black shrink-0 mt-0.5" />
          <span className="text-[10px] font-mono text-black leading-normal font-bold">
            DELETING A CUSTOM CATEGORY WILL SAFELY REASSIGN ITS TRANSACTIONS TO THE DEFAULT <strong>OTHERS</strong> CATEGORY AND CLEAN ASSOCIATED BUDGET CAPS.
          </span>
        </div>
      </div>

      {/* Monthly Budget Rules Block */}
      <div className="bg-white border-4 border-black p-6 brutalist-shadow flex flex-col justify-between" id="budgets-management-card">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div>
              <h3 className="font-display text-xl font-black text-black uppercase tracking-tight flex items-center gap-2" id="budgets-settings-title">
                <Target className="h-5 w-5 text-black" />
                Budget Allocations
              </h3>
              <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest mt-1">
                Configure spending alerts per category.
              </p>
            </div>

            <button
              onClick={onAddBudgetClick}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-black border-2 border-black hover:bg-yellow-400 font-black text-xs uppercase tracking-wider brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start sm:self-auto cursor-pointer"
              id="set-budget-rule-btn"
            >
              <Plus className="h-4 w-4" />
              Set Budget Limit
            </button>
          </div>

          {/* Current Month Active Budgets list */}
          <div className="mt-6 space-y-3 max-h-80 overflow-y-auto pr-1" id="budgets-rules-list">
            <div className="text-[11px] font-mono font-black text-black bg-neutral-100 border border-black px-3 py-1.5 flex items-center gap-1.5 uppercase tracking-wider mb-3">
              <Calendar className="h-3.5 w-3.5 text-black" /> Month Context: {activeMonth}
            </div>

            {monthBudgets.length === 0 ? (
              <div className="h-44 border-4 border-dashed border-black bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
                <Target className="h-8 w-8 text-black mb-2" />
                <span className="text-sm font-black text-black uppercase">No Budget Rules</span>
                <span className="text-xs font-mono text-neutral-500 mt-2">
                  Designate budget limits for this month to trigger exceedance alerts.
                </span>
              </div>
            ) : (
              monthBudgets.map((b) => (
                <div
                  key={b.id}
                  className="p-4 border-2 border-black hover:bg-yellow-50/50 bg-white transition-all flex items-center justify-between"
                  id={`budget-item-${b.id}`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-black text-black uppercase tracking-tight block">
                      {getCategoryName(b.categoryId).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-700 flex items-center gap-1.5">
                      <span>LIMIT:</span>
                      <strong className="text-black font-mono font-black">
                        ${b.limit.toFixed(2)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditBudgetClick(b)}
                      className="px-3 py-1.5 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs font-black uppercase tracking-tight cursor-pointer"
                      id={`edit-budget-item-${b.id}`}
                    >
                      Change Limit
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1.5 border border-black bg-white text-black hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      id={`delete-budget-item-${b.id}`}
                      title="Remove Budget Rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-black text-xs font-mono text-neutral-500 uppercase tracking-wider">
          * Compare totals against dynamic charts to check remaining allocations.
        </div>
      </div>
    </div>
  );
}
