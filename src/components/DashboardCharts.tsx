import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { PieChart as PieIcon, TrendingUp, BarChart3, HelpCircle } from "lucide-react";
import { FinanceData } from "../types";

interface DashboardChartsProps {
  data: FinanceData;
  activeMonth: string; // YYYY-MM
}

export default function DashboardCharts({ data, activeMonth }: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<"breakdown" | "trends" | "budgets">("breakdown");

  // Helper properties
  const currencySymbol = data.userPreferences.currency === "USD" ? "$" : data.userPreferences.currency;

  // 1. Filter month-specific expenses and budgets
  const monthExpenses = data.expenses.filter((e) => e.date.startsWith(activeMonth));
  const monthBudgets = data.budgets.filter((b) => b.month === activeMonth);

  // 2. Aggregate Data for PIE (Category Breakdown)
  const categoryMap: { [key: string]: { value: number; name: string; color: string } } = {};
  monthExpenses.forEach((exp) => {
    const category = data.categories.find((c) => c.id === exp.categoryId);
    const catId = exp.categoryId;
    const name = category?.name || "Others";
    const color = category?.color || "#6b7280";

    if (!categoryMap[catId]) {
      categoryMap[catId] = { value: 0, name, color };
    }
    categoryMap[catId].value += exp.amount;
  });
  const pieData = Object.values(categoryMap).sort((a, b) => b.value - a.value);
  const totalSpent = pieData.reduce((sum, item) => sum + item.value, 0);

  // 3. Aggregate Data for LINE CHART (Monthly Trends - Daily Spending)
  // Extract number of days in the active month
  const year = parseInt(activeMonth.split("-")[0]) || 2026;
  const month = parseInt(activeMonth.split("-")[1]) || 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyMap: { [key: number]: number } = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = 0;
  }
  monthExpenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (!isNaN(expDate.getTime())) {
      const day = expDate.getDate();
      dailyMap[day] = (dailyMap[day] || 0) + exp.amount;
    }
  });

  // Calculate cumulative spent as well to show cumulative trend lines!
  let cumulative = 0;
  const lineData = Object.keys(dailyMap)
    .map((dayStr) => {
      const dayNum = parseInt(dayStr);
      const spent = dailyMap[dayNum];
      cumulative += spent;
      return {
        day: `Day ${dayNum}`,
        "Daily Spent": parseFloat(spent.toFixed(2)),
        "Cumulative": parseFloat(cumulative.toFixed(2)),
      };
    })
    .sort((a, b) => {
      const aNum = parseInt(a.day.split(" ")[1]);
      const bNum = parseInt(b.day.split(" ")[1]);
      return aNum - bNum;
    });

  // 4. Aggregate Data for BAR CHART (Budget vs. Actual per Category)
  // Merge categories that have either a budget or an expense
  const barDataMap: {
    [key: string]: { categoryName: string; Actual: number; Budget: number; color: string };
  } = {};

  // Seed with budgets
  monthBudgets
    .filter((b) => b.categoryId !== "global")
    .forEach((b) => {
      const category = data.categories.find((c) => c.id === b.categoryId);
      if (category) {
        barDataMap[category.id] = {
          categoryName: category.name,
          Actual: 0,
          Budget: b.limit,
          color: category.color,
        };
      }
    });

  // Add expenses
  monthExpenses.forEach((exp) => {
    const category = data.categories.find((c) => c.id === exp.categoryId);
    if (category) {
      if (!barDataMap[category.id]) {
        barDataMap[category.id] = {
          categoryName: category.name,
          Actual: 0,
          Budget: 0, // No budget set
          color: category.color,
        };
      }
      barDataMap[category.id].Actual += exp.amount;
    }
  });

  const barData = Object.values(barDataMap);

  // Format charts tooltip content
  const customTooltipFormatter = (value: any) => [`${currencySymbol}${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`];

  return (
    <div className="bg-white border-4 border-black p-6 brutalist-shadow" id="charts-card">
      {/* Charts Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-black">
        <div>
          <h3 className="font-display text-xl font-black text-black uppercase tracking-tight" id="charts-main-title">
            Spending &amp; Budget Insights
          </h3>
          <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mt-1">
            Visual statistics for {activeMonth}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-2 border-black bg-black p-1" id="chart-tabs-nav">
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-1.5 px-4 py-2 font-display text-xs font-black uppercase transition-all ${
              activeTab === "breakdown"
                ? "bg-yellow-300 text-black border border-black"
                : "text-white hover:text-yellow-300"
            }`}
            id="tab-breakdown"
          >
            <PieIcon className="h-3.5 w-3.5" />
            Breakdown
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`flex items-center gap-1.5 px-4 py-2 font-display text-xs font-black uppercase transition-all ${
              activeTab === "trends"
                ? "bg-yellow-300 text-black border border-black"
                : "text-white hover:text-yellow-300"
            }`}
            id="tab-trends"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Trends
          </button>
          <button
            onClick={() => setActiveTab("budgets")}
            className={`flex items-center gap-1.5 px-4 py-2 font-display text-xs font-black uppercase transition-all ${
              activeTab === "budgets"
                ? "bg-yellow-300 text-black border border-black"
                : "text-white hover:text-yellow-300"
            }`}
            id="tab-budgets"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Budgets
          </button>
        </div>
      </div>

      {/* Render selected active Chart Tab */}
      <div className="pt-6" id="charts-visual-container">
        {monthExpenses.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 border-4 border-dashed border-black bg-neutral-50">
            <HelpCircle className="h-10 w-10 text-black mb-2" />
            <span className="text-base font-black text-black uppercase tracking-tight">No Transactions Found</span>
            <span className="text-xs font-mono text-neutral-500 mt-2 max-w-xs">
              Add some expenses or select another month to view active insights.
            </span>
          </div>
        ) : (
          <div>
            {/* BREAKDOWN PIE CHART */}
            {activeTab === "breakdown" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" id="pie-chart-view">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={customTooltipFormatter}
                        contentStyle={{
                          borderRadius: "0px",
                          border: "3px solid #000000",
                          boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                          fontFamily: "var(--font-mono)",
                          fontWeight: "bold",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie legend & percentages */}
                <div className="space-y-4" id="pie-chart-legend">
                  <h4 className="text-xs font-black text-black uppercase tracking-widest border-b border-black pb-2">
                    DISTRIBUTION BREAKDOWN
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2" id="pie-items-list">
                    {pieData.map((item, idx) => {
                      const pct = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 border-2 border-black hover:bg-neutral-50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3.5 w-3.5 border border-black flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-black text-black uppercase tracking-tight">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-black font-mono">
                              {currencySymbol}
                              {item.value.toFixed(2)}
                            </span>
                            <span className="text-xs font-mono font-bold text-neutral-500 w-12 text-right">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DAILY MONTHLY TRENDS LINE CHART */}
            {activeTab === "trends" && (
              <div className="h-72" id="trends-chart-view">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#000000", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                      axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                      tickLine={true}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#000000", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                      axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                      tickLine={true}
                    />
                    <Tooltip
                      formatter={customTooltipFormatter}
                      contentStyle={{
                        borderRadius: "0px",
                        border: "3px solid #000000",
                        boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "bold",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold", fontFamily: "var(--font-sans)", textTransform: "uppercase" }} />
                    <Line
                      name="Daily Spent"
                      type="monotone"
                      dataKey="Daily Spent"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ stroke: "#000000", strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#000000" }}
                    />
                    <Line
                      name="Cumulative Spend"
                      type="monotone"
                      dataKey="Cumulative"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* BUDGET VS ACTUAL SIDE-BY-SIDE BAR CHART */}
            {activeTab === "budgets" && (
              <div className="space-y-4" id="budgets-chart-view">
                {barData.length === 0 ? (
                  <div className="h-60 flex items-center justify-center text-xs font-mono text-neutral-500">
                    No categories have spending or budgets configured yet.
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="categoryName"
                          tick={{ fontSize: 10, fill: "#000000", fontWeight: "bold", fontFamily: "var(--font-sans)" }}
                          axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                          tickLine={true}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#000000", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                          axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                          tickLine={true}
                        />
                        <Tooltip
                          formatter={customTooltipFormatter}
                          contentStyle={{
                            borderRadius: "0px",
                            border: "3px solid #000000",
                            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                            fontFamily: "var(--font-mono)",
                            fontWeight: "bold",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }} />
                        <Bar name="Actual Spent" dataKey="Actual" fill="#4f46e5" stroke="#000000" strokeWidth={2} />
                        <Bar name="Budget Limit" dataKey="Budget" fill="#facc15" stroke="#000000" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
