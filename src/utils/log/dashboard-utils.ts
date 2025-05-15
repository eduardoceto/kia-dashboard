import type { LogEntry } from "./log-utils";

// Helper to parse YYYY-MM-DD (or YYYY-MM-DDTHH:mm:ss) to { year, month, day }
function parseYMD(dateString: string): { year: number, month: number, day: number } {
  // Handles both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss' formats
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return { year, month: month - 1, day }; // month is 0-indexed to match JS Date
}

// Get total waste for a given year
export function getTotalWasteForYear(logs: LogEntry[], year: number): number {
  let sum = 0;
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const { year: logYear } = parseYMD(log.fecha);
    const peso = Number(log.pesoTotal) || 0;
    if (logYear === year) {
      sum += peso;
    }
  }
  return sum;
}

// Get waste by type for a given year
export function getWasteByType(logs: LogEntry[], year: number): Record<string, number> {
  return logs.reduce((acc, log) => {
    const logYear = new Date(log.fecha).getFullYear();
    const peso = Number(log.pesoTotal) || 0;
    if (logYear === year) {
      acc[log.tipoMaterial] = (acc[log.tipoMaterial] || 0) + peso;
    }
    return acc;
  }, {} as Record<string, number>);
}

// Get N most recent logs
export function getRecentLogs(logs: LogEntry[], count: number = 5): LogEntry[] {
  return logs
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, count);
}

// Get monthly waste for a given type and year
export function getMonthlyWasteByType(logs: LogEntry[], year: number, tipoMaterial: string): { month: string, total: number }[] {
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));
  logs.forEach(log => {
    const date = new Date(log.fecha);
    if (date.getFullYear() === year && log.tipoMaterial === tipoMaterial) {
      const peso = Number(log.pesoTotal) || 0;
      months[date.getMonth()].total += peso;
    }
  });
  return months.map((m, i) => ({ month: new Date(year, i).toLocaleString('default', { month: 'short' }), total: m.total }));
}

// Get department leaderboard for a given year
export function getDepartmentLeaderboard(logs: LogEntry[], year: number): { departamento: string, total: number }[] {
  const deptMap: Record<string, number> = {};
  logs.forEach(log => {
    const logYear = new Date(log.fecha).getFullYear();
    const peso = Number(log.pesoTotal) || 0;
    if (logYear === year) {
      deptMap[log.departamento] = (deptMap[log.departamento] || 0) + peso;
    }
  });
  return Object.entries(deptMap)
    .map(([departamento, total]) => ({ departamento, total }))
    .sort((a, b) => b.total - a.total);
}

// Get breakdown of container types for a given year
export function getContainerTypeBreakdown(logs: LogEntry[], year: number): Record<string, number> {
  return logs.reduce((acc, log) => {
    const logYear = new Date(log.fecha).getFullYear();
    if (logYear === year) {
      acc[log.tipoContenedor] = (acc[log.tipoContenedor] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
}

// Get total log count for a given year
export function getLogCountForYear(logs: LogEntry[], year: number): number {
  return logs.filter(log => new Date(log.fecha).getFullYear() === year).length;
}

// Get total log count for a given month and year
export function getLogCountForMonth(logs: LogEntry[], year: number, month: number): number {
  return logs.filter(log => {
    const date = new Date(log.fecha);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;
}

// Get average waste per log for a given year
export function getAverageWastePerLog(logs: LogEntry[], year: number): number {
  const filtered = logs.filter(log => new Date(log.fecha).getFullYear() === year);
  if (filtered.length === 0) return 0;
  const total = filtered.reduce((sum, log) => sum + (Number(log.pesoTotal) || 0), 0);
  return total / filtered.length;
}

// Get logs for the last N days (including today)
export function getLogsForLastNDays(logs: LogEntry[], n: number, today: Date = new Date()): LogEntry[] {
  const start = new Date(today);
  start.setDate(start.getDate() - n + 1);
  return logs.filter(log => {
    const logDate = new Date(log.fecha);
    return logDate >= start && logDate <= today;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

// Get average waste per log for a given year and material
export function getAverageWastePerLogByMaterial(logs: LogEntry[], year: number, material: string): number {
  const filtered = logs.filter(log => new Date(log.fecha).getFullYear() === year && log.tipoMaterial === material);
  if (filtered.length === 0) return 0;
  const total = filtered.reduce((sum, log) => sum + (Number(log.pesoTotal) || 0), 0);
  return total / filtered.length;
}

// Get top company by waste for a given month and year
export function getTopCompanyForMonth(logs: LogEntry[], year: number, month: number): { compania: string, total: number } | null {
  const companyMap: Record<string, number> = {};
  logs.forEach(log => {
    const date = new Date(log.fecha);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const peso = Number(log.pesoTotal) || 0;
      companyMap[log.compania] = (companyMap[log.compania] || 0) + peso;
    }
  });
  const sorted = Object.entries(companyMap).map(([compania, total]) => ({ compania, total })).sort((a, b) => b.total - a.total);
  return sorted[0] || null;
}

// Get waste by department for a given month and year
export function getWasteByDepartmentForMonth(logs: LogEntry[], year: number, month: number): { departamento: string, total: number }[] {
  const deptMap: Record<string, number> = {};
  logs.forEach(log => {
    const date = new Date(log.fecha);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const peso = Number(log.pesoTotal) || 0;
      deptMap[log.departamento] = (deptMap[log.departamento] || 0) + peso;
    }
  });
  return Object.entries(deptMap)
    .map(([departamento, total]) => ({ departamento, total }))
    .sort((a, b) => b.total - a.total);
}

// Get most active driver by log count for a given month and year
export function getMostActiveDriverForMonth(logs: LogEntry[], year: number, month: number): { nombreChofer: string, totalLogs: number, totalWaste: number } | null {
  const driverMap: Record<string, { count: number, waste: number }> = {};
  logs.forEach(log => {
    const date = new Date(log.fecha);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const waste = Number(log.pesoTotal) || 0;
      if (!driverMap[log.nombreChofer]) {
        driverMap[log.nombreChofer] = { count: 0, waste: 0 };
      }
      driverMap[log.nombreChofer].count += 1;
      driverMap[log.nombreChofer].waste += waste;
    }
  });
  const sorted = Object.entries(driverMap)
    .map(([nombreChofer, { count, waste }]) => ({ nombreChofer, totalLogs: count, totalWaste: waste }))
    .sort((a, b) => b.totalLogs - a.totalLogs || b.totalWaste - a.totalWaste);
  return sorted[0] || null;
} 