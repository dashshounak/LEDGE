import express from "express";
import fs from "fs/promises";
import path from "path";
import { createServer as createViteServer } from "vite";
import { FinanceData, Expense, Budget, Category, UserPreferences } from "./src/types";

const DB_PATH = path.join(process.cwd(), "finance_db.json");

// Default initial state for seeding
const defaultData: FinanceData = {
  userPreferences: {
    currency: "USD",
    theme: "light",
    monthlyIncome: 5000,
  },
  categories: [
    { id: "cat_1", name: "Housing", color: "#4f46e5" }, // Indigo
    { id: "cat_2", name: "Groceries", color: "#10b981" }, // Emerald
    { id: "cat_3", name: "Entertainment", color: "#f59e0b" }, // Amber
    { id: "cat_4", name: "Dining Out", color: "#ef4444" }, // Red
    { id: "cat_5", name: "Transport", color: "#06b6d4" }, // Cyan
    { id: "cat_6", name: "Utilities", color: "#8b5cf6" }, // Violet
    { id: "cat_7", name: "Shopping", color: "#ec4899" }, // Pink
    { id: "cat_8", name: "Health & Fitness", color: "#14b8a6" }, // Teal
    { id: "cat_9", name: "Others", color: "#6b7280" }, // Gray
  ],
  budgets: [
    { id: "b_1", month: "2026-07", categoryId: "cat_2", limit: 500 }, // Groceries budget
    { id: "b_2", month: "2026-07", categoryId: "cat_3", limit: 200 }, // Entertainment budget
    { id: "b_3", month: "2026-07", categoryId: "cat_4", limit: 300 }, // Dining Out budget
  ],
  expenses: [
    {
      id: "exp_1",
      amount: 85.50,
      categoryId: "cat_2",
      date: "2026-07-01T12:00:00Z",
      paymentMethod: "Credit Card",
      description: "Weekly grocery run at Whole Foods",
      createdAt: "2026-07-01T12:05:00Z",
    },
    {
      id: "exp_2",
      amount: 45.00,
      categoryId: "cat_3",
      date: "2026-07-02T19:30:00Z",
      paymentMethod: "Debit Card",
      description: "Cinema ticket & snacks",
      createdAt: "2026-07-02T20:00:00Z",
    },
    {
      id: "exp_3",
      amount: 62.20,
      categoryId: "cat_4",
      date: "2026-07-03T20:00:00Z",
      paymentMethod: "Credit Card",
      description: "Dinner at local Italian bistro",
      createdAt: "2026-07-03T20:30:00Z",
    },
    {
      id: "exp_4",
      amount: 25.00,
      categoryId: "cat_5",
      date: "2026-07-05T09:00:00Z",
      paymentMethod: "Cash",
      description: "Gas station fuel",
      createdAt: "2026-07-05T09:10:00Z",
    },
    {
      id: "exp_5",
      amount: 124.30,
      categoryId: "cat_2",
      date: "2026-07-08T15:00:00Z",
      paymentMethod: "Debit Card",
      description: "Groceries bulk buying",
      createdAt: "2026-07-08T15:15:00Z",
    },
    {
      id: "exp_6",
      amount: 115.00,
      categoryId: "cat_6",
      date: "2026-07-09T10:00:00Z",
      paymentMethod: "Bank Transfer",
      description: "Monthly electricity bill",
      createdAt: "2026-07-09T10:05:00Z",
    },
    {
      id: "exp_7",
      amount: 48.00,
      categoryId: "cat_4",
      date: "2026-07-10T13:00:00Z",
      paymentMethod: "Credit Card",
      description: "Friday team lunch",
      createdAt: "2026-07-10T13:10:00Z",
    },
    {
      id: "exp_8",
      amount: 1200.00,
      categoryId: "cat_1",
      date: "2026-07-01T08:00:00Z",
      paymentMethod: "Bank Transfer",
      description: "Monthly rent payment",
      createdAt: "2026-07-01T08:05:00Z",
    },
  ],
};

// Robust helper to read and write database
async function getDb(): Promise<FinanceData> {
  try {
    const content = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // If file doesn't exist, seed it
    await saveDb(defaultData);
    return defaultData;
  }
}

async function saveDb(data: FinanceData): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get complete financial data state
  app.get("/api/finance", async (req, res) => {
    try {
      const data = await getDb();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read database: " + err.message });
    }
  });

  // API: Save user preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      const db = await getDb();
      const newPrefs: Partial<UserPreferences> = req.body;
      db.userPreferences = {
        ...db.userPreferences,
        ...newPrefs,
      };
      await saveDb(db);
      res.json(db.userPreferences);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update preferences: " + err.message });
    }
  });

  // API: Add or update a Category
  app.post("/api/categories", async (req, res) => {
    try {
      const db = await getDb();
      const { id, name, color } = req.body;
      if (!name || !color) {
        return res.status(400).json({ error: "Missing required fields (name, color)" });
      }

      if (id) {
        // Edit mode
        const index = db.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          db.categories[index] = { id, name, color };
        } else {
          return res.status(404).json({ error: "Category not found for update" });
        }
      } else {
        // Add mode
        const newCat: Category = {
          id: "cat_" + Date.now().toString(),
          name,
          color,
        };
        db.categories.push(newCat);
      }

      await saveDb(db);
      res.json(db.categories);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save category: " + err.message });
    }
  });

  // API: Delete Category (safe cleaning)
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;

      // Ensure "Others" category exists to re-assign deleted categories
      let others = db.categories.find(c => c.name.toLowerCase() === "others");
      if (!others) {
        others = { id: "cat_others", name: "Others", color: "#6b7280" };
        db.categories.push(others);
      }

      // Check if trying to delete "Others" itself
      if (id === others.id) {
        return res.status(400).json({ error: "Cannot delete the default 'Others' category" });
      }

      // Remove the category
      db.categories = db.categories.filter((c) => c.id !== id);

      // Reassign all expenses of this category to "Others"
      db.expenses = db.expenses.map((exp) => {
        if (exp.categoryId === id) {
          return { ...exp, categoryId: others!.id };
        }
        return exp;
      });

      // Remove budgets associated with this category
      db.budgets = db.budgets.filter((b) => b.categoryId !== id);

      await saveDb(db);
      res.json(db);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete category: " + err.message });
    }
  });

  // API: Add or update Budget limit
  app.post("/api/budgets", async (req, res) => {
    try {
      const db = await getDb();
      const { id, month, categoryId, limit } = req.body;

      if (!month || !categoryId || limit === undefined || limit === null) {
        return res.status(400).json({ error: "Missing required fields (month, categoryId, limit)" });
      }

      const limitNumber = parseFloat(limit);
      if (isNaN(limitNumber) || limitNumber < 0) {
        return res.status(400).json({ error: "Limit must be a non-negative number" });
      }

      if (id) {
        // Edit mode
        const index = db.budgets.findIndex((b) => b.id === id);
        if (index !== -1) {
          db.budgets[index] = { id, month, categoryId, limit: limitNumber };
        } else {
          return res.status(404).json({ error: "Budget record not found" });
        }
      } else {
        // Upsert behaviour: Check if budget already exists for this month and category combination
        const existingIndex = db.budgets.findIndex(
          (b) => b.month === month && b.categoryId === categoryId
        );
        if (existingIndex !== -1) {
          db.budgets[existingIndex].limit = limitNumber;
        } else {
          const newBudget: Budget = {
            id: "b_" + Date.now().toString(),
            month,
            categoryId,
            limit: limitNumber,
          };
          db.budgets.push(newBudget);
        }
      }

      await saveDb(db);
      res.json(db.budgets);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save budget limit: " + err.message });
    }
  });

  // API: Delete Budget
  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      db.budgets = db.budgets.filter((b) => b.id !== id);
      await saveDb(db);
      res.json(db.budgets);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete budget limit: " + err.message });
    }
  });

  // API: Add or update Expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const db = await getDb();
      const { id, amount, categoryId, date, paymentMethod, description } = req.body;

      if (!amount || !categoryId || !date || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields (amount, categoryId, date, paymentMethod)" });
      }

      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      if (id) {
        // Edit mode
        const index = db.expenses.findIndex((e) => e.id === id);
        if (index !== -1) {
          db.expenses[index] = {
            ...db.expenses[index],
            amount: amountNumber,
            categoryId,
            date,
            paymentMethod,
            description: description || "",
          };
        } else {
          return res.status(404).json({ error: "Expense not found for update" });
        }
      } else {
        // Add mode
        const newExpense: Expense = {
          id: "exp_" + Date.now().toString(),
          amount: amountNumber,
          categoryId,
          date,
          paymentMethod,
          description: description || "",
          createdAt: new Date().toISOString(),
        };
        db.expenses.push(newExpense);
      }

      await saveDb(db);
      res.json(db.expenses);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save expense: " + err.message });
    }
  });

  // API: Delete Expense
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      db.expenses = db.expenses.filter((e) => e.id !== id);
      await saveDb(db);
      res.json(db.expenses);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete expense: " + err.message });
    }
  });

  // Mount Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});
