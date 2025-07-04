# 🔌 API Documentation - Beba Água

## 📋 **Overview**

This document outlines the internal API structure and service layer architecture of the Beba Água application. While primarily a local-first application, the services are designed with future cloud integration in mind.

---

## 🗄 **Database Service API**

### **Core Methods**

#### `initialize(): Promise<void>`

Initializes the SQLite database and runs necessary migrations.

```typescript
await databaseService.initialize();
```

#### `addWaterRecord(amount, dailyGoal, userWeight): Promise<WaterRecord>`

Adds a new water intake record to the database.

**Parameters:**

- `amount: number` - Water amount in milliliters
- `dailyGoal: number` - Daily goal in milliliters
- `userWeight?: number` - User weight in kilograms

**Returns:** `Promise<WaterRecord>`

```typescript
const record = await databaseService.addWaterRecord(250, 2000, 70);
// Returns: { id: 1, amount: 250, date: "2025-07-04", time: "14:30:00", ... }
```

---

### **Statistics & Analytics**

#### `getDailyStats(filter): Promise<DailyStats[]>`

Retrieves daily statistics with advanced filtering options.

**Parameters:**

```typescript
interface FilterOptions {
  period: "week" | "month" | "year";
  year?: number;
  month?: number;
  date?: string;
}
```

**Returns:**

```typescript
interface DailyStats {
  date: string;
  total_amount: number;
  goal: number;
  records_count: number;
  completed: boolean;
}
```

**Example:**

```typescript
// Get current week stats
const weekStats = await databaseService.getDailyStats({
  period: "week",
  date: "2025-07-04",
});

// Get specific month stats
const monthStats = await databaseService.getDailyStats({
  period: "month",
  year: 2025,
  month: 7,
});
```

#### `getCurrentStreak(): Promise<number>`

Calculates the current consecutive days streak.

```typescript
const streak = await databaseService.getCurrentStreak();
// Returns: 7 (days)
```

#### `getAvailableYears(): Promise<number[]>`

Gets all years with recorded data.

```typescript
const years = await databaseService.getAvailableYears();
// Returns: [2024, 2025]
```

#### `getAvailableMonths(year): Promise<number[]>`

Gets all months with data for a specific year.

```typescript
const months = await databaseService.getAvailableMonths(2025);
// Returns: [1, 2, 3, 7] (January, February, March, July)
```

---

## 💾 **Storage Service API**

### **User Settings Management**

#### `getUserSettings(): Promise<UserSettings>`

Retrieves user configuration from local storage.

```typescript
interface UserSettings {
  weight: number;
  cupSize: number;
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderInterval: number;
}

const settings = await storageService.getUserSettings();
```

#### `saveUserSettings(settings): Promise<void>`

Persists user settings to local storage.

```typescript
await storageService.saveUserSettings({
  weight: 75,
  cupSize: 300,
  dailyGoal: 2500,
  remindersEnabled: true,
  reminderInterval: 2,
});
```

### **Water Intake Management**

#### `getWaterIntake(): Promise<number>`

Gets current day's water intake from cache.

```typescript
const currentIntake = await storageService.getWaterIntake();
// Returns: 1500 (milliliters)
```

#### `addWaterIntake(amount): Promise<number>`

Adds water to current day's intake and returns new total.

```typescript
const newTotal = await storageService.addWaterIntake(250);
// Returns: 1750 (previous 1500 + 250)
```

#### `resetWaterIntake(): Promise<void>`

Resets current day's water intake (typically called at midnight).

```typescript
await storageService.resetWaterIntake();
```

---

## 🔔 **Notification Service API**

### **Reminder Management**

#### `scheduleWaterReminders(interval): Promise<void>`

Schedules recurring water reminder notifications.

**Parameters:**

- `interval: number` - Hours between reminders (1-8)

```typescript
await notificationService.scheduleWaterReminders(2); // Every 2 hours
```

#### `cancelAllReminders(): Promise<void>`

Cancels all scheduled water reminders.

```typescript
await notificationService.cancelAllReminders();
```

#### `requestPermissions(): Promise<boolean>`

Requests notification permissions from the user.

```typescript
const granted = await notificationService.requestPermissions();
if (granted) {
  // Setup notifications
}
```

---

## 🧮 **Utility Functions**

### **Water Calculations**

#### `calculateDailyGoal(weight): number`

Calculates recommended daily water intake based on weight.

```typescript
const goal = calculateDailyGoal(70); // 70kg
// Returns: 2450 (ml) - Based on 35ml per kg
```

#### `formatVolume(amount): string`

Formats water amount for display.

```typescript
formatVolume(1500); // Returns: "1.5L"
formatVolume(250); // Returns: "250ml"
formatVolume(0); // Returns: "0ml"
```

#### `getProgressPercentage(current, goal): number`

Calculates progress percentage towards daily goal.

```typescript
const progress = getProgressPercentage(1500, 2000);
// Returns: 75 (percent)
```

---

## 🎯 **Context API**

### **WaterContext Provider**

The main state management context providing global access to water-related data.

```typescript
interface WaterContextType {
  // State
  waterIntake: number;
  dailyGoal: number;
  userSettings: UserSettings;
  loading: boolean;
  goalAchieved: boolean;

  // Actions
  addWater: (amount?: number) => Promise<void>;
  updateUserSettings: (settings: UserSettings) => Promise<void>;
  resetDailyIntake: () => Promise<void>;
}
```

**Usage:**

```typescript
const { waterIntake, addWater, userSettings } = useWaterContext();

// Add default cup size
await addWater();

// Add custom amount
await addWater(500);
```

---

## 📊 **Data Models**

### **Core Interfaces**

```typescript
interface WaterRecord {
  id: number;
  amount: number;
  date: string; // ISO date: "2025-07-04"
  time: string; // ISO time: "14:30:00"
  daily_goal: number;
  user_weight?: number;
  created_at: string; // ISO datetime
}

interface DailyStats {
  date: string;
  total_amount: number;
  goal: number;
  records_count: number;
  completed: boolean;
}

interface UserSettings {
  weight: number; // Kilograms
  cupSize: number; // Milliliters
  dailyGoal: number; // Milliliters
  remindersEnabled: boolean;
  reminderInterval: number; // Hours
}
```

---

## ⚡ **Performance Considerations**

### **Database Optimizations**

1. **Indexed Queries**

   ```sql
   CREATE INDEX idx_water_records_date ON water_records(date);
   CREATE INDEX idx_water_records_date_time ON water_records(date, time);
   ```

2. **Prepared Statements**

   ```typescript
   // Reused prepared statements for better performance
   const insertStatement = await db.prepareAsync(
     "INSERT INTO water_records (amount, date, time, daily_goal) VALUES (?, ?, ?, ?)"
   );
   ```

3. **Batch Operations**
   ```typescript
   // Transaction-wrapped batch inserts
   await db.withTransactionAsync(async () => {
     for (const record of records) {
       await insertStatement.executeAsync([...record]);
     }
   });
   ```

### **Memory Management**

1. **Pagination for Large Datasets**

   ```typescript
   const getPagedRecords = async (page: number, limit: number = 50) => {
     const offset = page * limit;
     return await db.getAllAsync(
       "SELECT * FROM water_records ORDER BY date DESC LIMIT ? OFFSET ?",
       [limit, offset]
     );
   };
   ```

2. **Cleanup Old Records**
   ```typescript
   // Remove records older than 2 years
   const cleanupOldRecords = async () => {
     const cutoffDate = new Date();
     cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);

     await db.runAsync("DELETE FROM water_records WHERE date < ?", [
       cutoffDate.toISOString().split("T")[0],
     ]);
   };
   ```

---

## 🔒 **Security & Validation**

### **Input Validation**

```typescript
// Zod schemas for runtime validation
const WaterAmountSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be positive")
    .max(5000, "Amount cannot exceed 5L")
    .int("Amount must be whole number"),
});

const UserSettingsSchema = z.object({
  weight: z.number().min(20).max(300),
  cupSize: z.number().min(50).max(1000),
  dailyGoal: z.number().min(500).max(10000),
  remindersEnabled: z.boolean(),
  reminderInterval: z.number().min(1).max(8),
});
```

### **Data Sanitization**

```typescript
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML
    .substring(0, 100); // Limit length
};
```

---

## 🧪 **Testing Examples**

### **Service Layer Tests**

```typescript
describe("DatabaseService", () => {
  beforeEach(async () => {
    await databaseService.initialize();
    await databaseService.clearAllData(); // Test isolation
  });

  it("should calculate streak correctly", async () => {
    // Setup consecutive days with goals met
    const records = [
      { amount: 2000, date: "2025-07-01" },
      { amount: 2500, date: "2025-07-02" },
      { amount: 2200, date: "2025-07-03" },
      { amount: 2100, date: "2025-07-04" },
    ];

    for (const record of records) {
      await databaseService.addWaterRecord(record.amount, 2000, 70);
    }

    const streak = await databaseService.getCurrentStreak();
    expect(streak).toBe(4);
  });
});
```

---

## 🔮 **Future API Extensions**

### **Planned Cloud Integration**

```typescript
// Future cloud sync service
interface CloudSyncService {
  syncToCloud(): Promise<SyncResult>;
  syncFromCloud(): Promise<SyncResult>;
  resolveConflicts(conflicts: ConflictSet): Promise<void>;
  enableAutoSync(enabled: boolean): Promise<void>;
}

// Future health integration
interface HealthService {
  connectToAppleHealth(): Promise<boolean>;
  connectToGoogleFit(): Promise<boolean>;
  importHealthData(): Promise<HealthData>;
  exportToHealth(records: WaterRecord[]): Promise<void>;
}
```

---

_This API documentation is automatically updated with each release. For the latest version, see the source code._
