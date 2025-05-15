"use client";

import { FaChartBar } from "react-icons/fa6";
import { FaWeight } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { routing } from "@/src/i18n/routing";


import { DashboardCard } from "@/src/components/ui/dashboard-card";
import { getHistoricalLogs } from "@/src/components/testData/dataLogs";
import type { LogEntry, LodosResiduo, MetalResiduo, OtrosResiduo, DestruidasResiduo } from "@/src/utils/log/log-utils";
import {
  getWasteByType,
  getRecentLogs,
  getMonthlyWasteByType,
  getLogCountForYear,
  getLogCountForMonth,
  getAverageWastePerLogByMaterial,
  getMostActiveDriverForMonth,
} from "@/src/utils/log/dashboard-utils";
import { Progress } from "@/src/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Download } from "lucide-react";
import { generatePdf } from "@/src/actions/generatePdf";
import { formatDate } from "@/src/utils/log/log-utils";


function DashboardHeader() {
  const { profile } = useUser();
  const pathname = usePathname();
  const [today, setToday] = useState("");
  useEffect(() => {
    const date = new Date();
    setToday(date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // Breadcrumbs logic (copied from TopNav)
  function formatSegment(segment: string): string {
    if (!segment) return "";
    return segment.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
  const rawSegments = pathname.split("/").filter(Boolean);
  const localeSegment = routing.locales.includes(rawSegments[0] as (typeof routing.locales)[number]) ? rawSegments[0] : null;
  const displaySegments = localeSegment ? rawSegments.slice(1) : rawSegments;
  const baseHref = localeSegment ? `/${localeSegment}` : '/';
  const breadcrumbs = [
    { label: "Dashboard", href: baseHref + "/dashboard" },
    ...displaySegments.slice(1).map((seg, idx) => {
      const label = formatSegment(seg);
      const originalIndex = localeSegment ? idx + 2 : idx + 1;
      const href = "/" + rawSegments.slice(0, originalIndex + 1).join("/");
      return { label, href };
    })
  ];

  const profileName = (profile?.first_name ? profile.first_name + " " : "") + (profile?.last_name || "User");

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#101a26] rounded-xl shadow p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold leading-tight text-white">Hello, {profileName}</span>
          <span className="text-xs text-gray-400 mt-1">{today}</span>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
      
        </div>
      </div>
      <div className="flex flex-row items-center mt-4 w-full">
        <div className="font-medium text-xs flex items-center space-x-1 truncate max-w-[400px] text-gray-400">
          {breadcrumbs.map((item, index) => (
            <div key={item.label + index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 text-gray-500 mx-1" />}
              {item.href && index !== breadcrumbs.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="hover:underline">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MONTHLY_TARGET = 10000; // monthly target in kg
const COLORS = ["#2563eb", "#22c55e", "#f59e42", "#ef4444"];

// Add utility for waste by material for the month
const getWasteByMaterialForMonth = (logs: LogEntry[], year: number, month: number) => {
  const matMap: Record<string, number> = {};
  logs.forEach(log => {
    const date = new Date(log.fecha);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const peso = Number(log.pesoTotal) || 0;
      matMap[log.tipoMaterial] = (matMap[log.tipoMaterial] || 0) + peso;
    }
  });
  return Object.entries(matMap).map(([tipoMaterial, total]) => ({ tipoMaterial, total }));
};

export default function Dashboard() {
  const logs = useMemo(() => getHistoricalLogs(), []);
  const year = 2025; // Today is 11 May 2025
  const month = 4; // May (0-indexed)

  // Aggregated data
  const wasteByType = useMemo(() => getWasteByType(logs, year), [logs, year]);
  const [selectedType, setSelectedType] = useState<string>(Object.keys(wasteByType)[0] || "metal");
  const [selectedAvgType, setSelectedAvgType] = useState<string>(Object.keys(wasteByType)[0] || "metal");
  const monthlyWaste = useMemo(() => getMonthlyWasteByType(logs, year, selectedType), [logs, year, selectedType]);
  const logCountYear = useMemo(() => getLogCountForYear(logs, year), [logs, year]);
  const logCountMonth = useMemo(() => getLogCountForMonth(logs, year, month), [logs, year, month]);
  const avgWastePerLog = useMemo(() => getAverageWastePerLogByMaterial(logs, year, selectedAvgType), [logs, year, selectedAvgType]);
  const mostActiveDriver = useMemo(() => getMostActiveDriverForMonth(logs, year, month), [logs, year, month]);
  const wasteByMaterialMonth = useMemo(() => getWasteByMaterialForMonth(logs, year, month), [logs, year, month]);

  // Pie chart data
  const pieData = Object.entries(wasteByType).map(([type, value]) => ({ name: type, value }));

  // Monthly progress
  const monthlyTotal = logs.filter(log => {
    const date = new Date(log.fecha);
    return date.getFullYear() === year && date.getMonth() === month;
  }).reduce((sum, log) => sum + (Number(log.pesoTotal) || 0), 0);
  const monthlyProgress = Math.min((monthlyTotal / MONTHLY_TARGET) * 100, 100);

  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const recentLogs = useMemo<LogEntry[]>(() => getRecentLogs(logs, 5), [logs]);

  return (
    <div className="space-y-8 bg-[#f6f7fb] min-h-screen p-6">
      <DashboardHeader />
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-8">
        {/* Monthly Waste Progress - full width */}
        <DashboardCard title={<span className="flex items-center gap-2 text-2xl font-semibold text-blue-900"><FaChartBar className="text-blue-500" />Monthly Waste Progress</span>} className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-8 flex flex-col justify-center h-full min-h-[260px] col-span-1 md:col-span-3">
          <div className="flex flex-col items-center gap-6 w-full">
            <span className="text-6xl font-extrabold text-blue-700">{monthlyTotal.toLocaleString()} <span className="text-2xl font-semibold">kg</span></span>
            <span className="text-base text-gray-500">Target: {MONTHLY_TARGET.toLocaleString()} kg</span>
            <div className="w-full max-w-2xl mx-auto">
              <Progress value={monthlyProgress} className="h-3 mt-4 bg-blue-100" />
            </div>
            <span className="text-base text-gray-400">{monthlyProgress.toFixed(1)}% of target</span>
          </div>
        </DashboardCard>
        {/* Waste by Type Pie Chart - bigger and better spaced */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaWeight className="text-green-500" />Waste by Type</span>} className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[260px]">
          <div className="flex flex-col items-center gap-6 mt-2 mb-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-pie-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {pieData.map((entry, idx) => (
                <span key={entry.name} className="flex items-center text-sm">
                  <span className="w-4 h-4 rounded-full mr-2" style={{ background: COLORS[idx % COLORS.length] }} />
                  {entry.name}: {entry.value.toLocaleString()} kg
                </span>
              ))}
            </div>
          </div>
        </DashboardCard>
        {/* Monthly Summary Widget */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900 mb-4"><FaChartBar className="text-yellow-500" />Monthly Summary</span>} className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-start h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-start h-full gap-6">
            <span className="text-5xl font-extrabold text-yellow-700">{logCountMonth}</span>
            <span className="text-base text-gray-700">logs this month</span>
            <span className="text-2xl font-bold text-yellow-700">{monthlyTotal.toLocaleString()} kg</span>
            <span className="text-base text-gray-700">{logCountMonth > 0 ? (monthlyTotal / logCountMonth).toLocaleString(undefined, { maximumFractionDigits: 1 }) : 0} kg/log</span>
            {mostActiveDriver && (
              <span className="text-xs text-gray-500">Most active driver: <span className="font-semibold">{mostActiveDriver.nombreChofer}</span> ({mostActiveDriver.totalLogs} logs)</span>
            )}
          </div>
        </DashboardCard>
        {/* Monthly Waste Trend */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-indigo-500" />Monthly Waste Trend</span>} className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[320px]">
          <div className="flex flex-col justify-center h-full">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyWaste} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs">Type:</span>
              <select
                className="text-xs border rounded px-2 py-1"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                {Object.keys(wasteByType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </DashboardCard>
        {/* Recent Waste Logs Table (redesigned, wide) */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-gray-500" />Recent Waste Logs</span>} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-6 col-span-2 flex flex-col justify-between h-full min-h-[260px]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2">#</th>
                  <th className="px-2">Type</th>
                  <th className="px-2">Date</th>
                  <th className="px-2">Amount</th>
                  <th className="px-2">Department</th>
                  <th className="px-2">Driver</th>
                  <th className="px-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log: LogEntry, idx: number) => {
                  // Color by waste type
                  const typeColor = {
                    metal: "bg-blue-500",
                    otros: "bg-green-500",
                    lodos: "bg-orange-400",
                    destruidas: "bg-red-500",
                  }[log.tipoMaterial] || "bg-gray-400";
                  // Driver initials
                  const initials = log.nombreChofer.split(' ').map(n => n[0]).join('').slice(0,2);
                  return (
                    <tr key={log.folio || idx} className="bg-white rounded-lg shadow-sm align-middle">
                      <td className="px-2 py-2 font-semibold text-gray-700">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center gap-1`}>
                          <span className={`w-3 h-3 rounded-full ${typeColor} inline-block`} />
                          <span className="capitalize font-medium">{log.tipoMaterial}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">{log.fecha}</td>
                      <td className="px-2 py-2">{Number(log.pesoTotal).toLocaleString()} kg</td>
                      <td className="px-2 py-2">{log.departamento}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                            {initials}
                          </span>
                          <span className="font-medium text-gray-700">{log.nombreChofer}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <Dialog open={isDialogOpen && selectedLog?.folio === log.folio} onOpenChange={(open) => { if (!open) setSelectedLog(null); setIsDialogOpen(open); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedLog(log); setIsDialogOpen(true); }} className="text-primary">Details</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <DialogTitle>Log Details</DialogTitle>
                            </div>
                            <DialogHeader>
                              <DialogTitle>Log Details #{selectedLog?.folio}</DialogTitle>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-6 py-4">
                                {/* General Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                                    <p>{formatDate(selectedLog.fecha)}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Departure Time</h3>
                                    <p>{selectedLog.horaSalida}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Folio</h3>
                                    <p>{selectedLog.folio}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                                    <p>{selectedLog.departamento}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                                    <p>{selectedLog.motivo}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Authorized By</h3>
                                    <p>{selectedLog.personaAutoriza}</p>
                                  </div>
                                </div>
                                {/* Transport Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Driver</h3>
                                    <p>{selectedLog.nombreChofer}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                                    <p>{selectedLog.compania}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Plates</h3>
                                    <p>{selectedLog.placas}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Economic No.</h3>
                                    <p>{selectedLog.numeroEconomico}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Origin</h3>
                                    <p>{selectedLog.procedencia}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Destination</h3>
                                    <p>{selectedLog.destino}</p>
                                  </div>
                                </div>
                                {/* Material and Container Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Material Type</h3>
                                    <p>{selectedLog.tipoMaterial}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Container Type</h3>
                                    <p>{selectedLog.tipoContenedor}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Weight</h3>
                                    <p>
                                      {selectedLog.pesoTotal} {selectedLog.tipoMaterial === "otros" || selectedLog.tipoMaterial === "metal" ? ((selectedLog.residuos as MetalResiduo | OtrosResiduo)?.unidad || "KG") : "KG"}
                                    </p>
                                  </div>
                                </div>
                                {/* Detailed Residues Section */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Material Specific Details</h3>
                                  {(() => {
                                    if (!selectedLog.residuos) return null;
                                    switch (selectedLog.tipoMaterial) {
                                      case "lodos": {
                                        const details = selectedLog.residuos as LodosResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Residue Name</h4>
                                              <p>{details.nombreResiduo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Manifest No.</h4>
                                              <p>{details.manifiestoNo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Area</h4>
                                              <p>{details.area || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Transport No. Services</h4>
                                              <p>{details.transporteNoServicios || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Weight (Kg)</h4>
                                              <p>{details.pesoKg || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "metal": {
                                        const details = selectedLog.residuos as MetalResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Residue Type</h4>
                                              <p>{details.tipoResiduo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                              <p>{details.item || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                                              <p>{details.cantidad || "-"} {details.unidad || ""}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                              <p>{details.remisionHMMX || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Remisión KIA</h4>
                                              <p>{details.remisionKia || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "otros": {
                                        const details = selectedLog.residuos as OtrosResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Waste Type</h4>
                                              <p>{details.tipoDesecho || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                              <p>{details.item || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                                              <p>{details.cantidad || "-"} {details.unidad || ""}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                              <p>{details.remisionHMMX || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Remisión KIA</h4>
                                              <p>{details.remisionKia || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "destruidas": {
                                        const details = selectedLog.residuos as DestruidasResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Residues</h4>
                                              <p>{details.residuos || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Area</h4>
                                              <p>{details.area || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">Weight</h4>
                                              <p>{details.peso || "-"} kg</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      default:
                                        return <p>No details available for this material type.</p>;
                                    }
                                  })()}
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => selectedLog && generatePdf(selectedLog)}>
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardCard>
        {/* Waste by Material (bar chart, this month) */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-pink-500" />Waste by Material (This Month)</span>} className="bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[320px]">
          <div className="flex flex-col justify-center h-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={wasteByMaterialMonth} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="tipoMaterial" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="total" barSize={24}>
                  {wasteByMaterialMonth.map((entry, idx) => (
                    <Cell key={`cell-${entry.tipoMaterial}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
        {/* Waste Log Count (Year/Month) */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-blue-400" />Waste Log Count</span>} className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-evenly h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-evenly h-full gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">Year</span>
              <span className="text-5xl font-extrabold text-blue-700">{logCountYear}</span>
              <span className="text-sm font-semibold text-blue-900">logs</span>
            </div>
            <div className="w-2/3 h-px bg-blue-100 my-2" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">Month</span>
              <span className="text-5xl font-extrabold text-blue-700">{logCountMonth}</span>
              <span className="text-sm font-semibold text-blue-900">logs</span>
            </div>
          </div>
        </DashboardCard>
        {/* Average Waste per Log (with selector) */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900 mb-4"><FaWeight className="text-green-500" />Average Waste per Log</span>} className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-start h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-start h-full gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-green-900">Type:</span>
              <select
                className="text-xs border rounded px-2 py-1 ml-2"
                value={selectedAvgType}
                onChange={e => setSelectedAvgType(e.target.value)}
              >
                {Object.keys(wasteByType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <span className="text-5xl font-extrabold text-green-700">{avgWastePerLog.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg font-semibold">kg</span></span>
            <span className="text-xs text-gray-500">Year {year} ({selectedAvgType})</span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}