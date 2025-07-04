import * as SQLite from "expo-sqlite";

export interface WaterRecord {
  id: number;
  date: string; // YYYY-MM-DD
  datetime: string; // YYYY-MM-DD HH:mm:ss
  amount: number; // ml
  goal: number; // ml
  weight: number; // kg
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_amount: number;
  goal: number;
  records_count: number;
  completed: boolean;
}

export interface FilterOptions {
  period: "day" | "week" | "month" | "year";
  year?: number;
  month?: number; // 1-12
  date?: string; // YYYY-MM-DD
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("bebaagua.db");

      // Criar tabela se não existir
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS water_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          datetime TEXT NOT NULL,
          amount INTEGER NOT NULL,
          goal INTEGER NOT NULL,
          weight REAL NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Criar índices para melhor performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_date ON water_records(date);
        CREATE INDEX IF NOT EXISTS idx_datetime ON water_records(datetime);
      `);

      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  async addWaterRecord(amount: number, goal: number, weight: number): Promise<number> {
    if (!this.db) await this.initialize();

    const now = new Date();
    const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const datetime = now.toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:mm:ss
    const created_at = now.toISOString();

    const result = await this.db!.runAsync(
      "INSERT INTO water_records (date, datetime, amount, goal, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [date, datetime, amount, goal, weight, created_at]
    );

    return result.lastInsertRowId;
  }

  async getDailyStats(filter: FilterOptions): Promise<DailyStats[]> {
    if (!this.db) await this.initialize();

    let whereClause = "";
    let params: any[] = [];

    switch (filter.period) {
      case "day":
        if (filter.date) {
          whereClause = "WHERE date = ?";
          params = [filter.date];
        }
        break;

      case "week":
        if (filter.date) {
          const startDate = new Date(filter.date);
          startDate.setDate(startDate.getDate() - startDate.getDay()); // Domingo
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6); // Sábado

          whereClause = "WHERE date BETWEEN ? AND ?";
          params = [
            startDate.toISOString().slice(0, 10),
            endDate.toISOString().slice(0, 10),
          ];
        }
        break;

      case "month":
        if (filter.year && filter.month) {
          const yearMonth = `${filter.year}-${filter.month.toString().padStart(2, "0")}`;
          whereClause = "WHERE date LIKE ?";
          params = [`${yearMonth}%`];
        }
        break;

      case "year":
        if (filter.year) {
          whereClause = "WHERE date LIKE ?";
          params = [`${filter.year}%`];
        }
        break;
    }

    const query = `
      SELECT 
        date,
        SUM(amount) as total_amount,
        MAX(goal) as goal,
        COUNT(*) as records_count,
        CASE WHEN SUM(amount) >= MAX(goal) THEN 1 ELSE 0 END as completed
      FROM water_records 
      ${whereClause}
      GROUP BY date 
      ORDER BY date DESC
    `;

    const rows = (await this.db!.getAllAsync(query, params)) as any[];

    return rows.map((row) => ({
      date: row.date,
      total_amount: row.total_amount,
      goal: row.goal,
      records_count: row.records_count,
      completed: row.completed === 1,
    }));
  }

  async getWaterRecords(filter: FilterOptions): Promise<WaterRecord[]> {
    if (!this.db) await this.initialize();

    let whereClause = "";
    let params: any[] = [];

    switch (filter.period) {
      case "day":
        if (filter.date) {
          whereClause = "WHERE date = ?";
          params = [filter.date];
        }
        break;

      case "month":
        if (filter.year && filter.month) {
          const yearMonth = `${filter.year}-${filter.month.toString().padStart(2, "0")}`;
          whereClause = "WHERE date LIKE ?";
          params = [`${yearMonth}%`];
        }
        break;

      case "year":
        if (filter.year) {
          whereClause = "WHERE date LIKE ?";
          params = [`${filter.year}%`];
        }
        break;
    }

    const query = `
      SELECT * FROM water_records 
      ${whereClause}
      ORDER BY datetime DESC
    `;

    const rows = (await this.db!.getAllAsync(query, params)) as WaterRecord[];
    return rows;
  }

  async getMonthlyTotals(
    year: number
  ): Promise<{ month: number; total: number; goal: number; completed: boolean }[]> {
    if (!this.db) await this.initialize();

    const query = `
      SELECT 
        CAST(strftime('%m', date) AS INTEGER) as month,
        SUM(amount) as total,
        AVG(goal) as goal,
        CASE WHEN SUM(amount) >= (COUNT(DISTINCT date) * AVG(goal)) THEN 1 ELSE 0 END as completed
      FROM water_records 
      WHERE date LIKE ?
      GROUP BY strftime('%m', date)
      ORDER BY month
    `;

    const rows = (await this.db!.getAllAsync(query, [`${year}%`])) as any[];

    return rows.map((row) => ({
      month: row.month,
      total: row.total,
      goal: row.goal,
      completed: row.completed === 1,
    }));
  }

  async getYearlyStats(): Promise<
    { year: number; total: number; days: number; average: number }[]
  > {
    if (!this.db) await this.initialize();

    const query = `
      SELECT 
        CAST(strftime('%Y', date) AS INTEGER) as year,
        SUM(amount) as total,
        COUNT(DISTINCT date) as days,
        AVG(amount) as average
      FROM water_records 
      GROUP BY strftime('%Y', date)
      ORDER BY year DESC
    `;

    const rows = (await this.db!.getAllAsync(query)) as any[];

    return rows.map((row) => ({
      year: row.year,
      total: row.total,
      days: row.days,
      average: Math.round(row.average),
    }));
  }

  async getCurrentStreak(): Promise<number> {
    if (!this.db) await this.initialize();

    const query = `
      SELECT 
        date,
        SUM(amount) as total_amount,
        MAX(goal) as goal
      FROM water_records 
      GROUP BY date 
      ORDER BY date DESC
    `;

    const rows = (await this.db!.getAllAsync(query)) as any[];

    let streak = 0;
    for (const row of rows) {
      if (row.total_amount >= row.goal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getAvailableYears(): Promise<number[]> {
    if (!this.db) await this.initialize();

    const query = `
      SELECT DISTINCT CAST(strftime('%Y', date) AS INTEGER) as year
      FROM water_records 
      ORDER BY year DESC
    `;

    const rows = (await this.db!.getAllAsync(query)) as { year: number }[];
    return rows.map((row) => row.year);
  }

  async getAvailableMonths(year: number): Promise<number[]> {
    if (!this.db) await this.initialize();

    const query = `
      SELECT DISTINCT CAST(strftime('%m', date) AS INTEGER) as month
      FROM water_records 
      WHERE date LIKE ?
      ORDER BY month
    `;

    const rows = (await this.db!.getAllAsync(query, [`${year}%`])) as { month: number }[];
    return rows.map((row) => row.month);
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.runAsync("DELETE FROM water_records");
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
