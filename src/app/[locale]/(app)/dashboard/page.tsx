"use client";

import { FaChartBar } from "react-icons/fa6";
import { FaWeight } from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";

import { DashboardCard } from "@/src/components/ui/dashboard-card";
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
import DashboardHeader from "@/src/components/DashboardHeader";
import { fetchWasteDisposalLogs } from "@/src/actions/submitWasteDisposal";
import Loader from "@/src/components/ui/Loader";


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
  const t = useTranslations('dashboardPage');
  const tCommon = useTranslations('common');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = 2025; // Today is 11 May 2025
  const month = 4; // May (0-indexed)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchWasteDisposalLogs();
      if (result.success) {
        const excelIdToTipoMaterial: Record<string, string> = {
          "1": "Lodos",
          "2": "Destruidas",
          "3": "Otros",
          "4": "Metal",
        };
        const mappedLogs = (result.data || []).map((log: unknown) => {
          const l = log as Record<string, unknown>;
          // Use drivers field from explicit join
          const driver = Array.isArray(l.drivers) ? l.drivers[0] : l.drivers;
          const getDriverField = (field: string): string => {
            if (!driver) return '';
            if (Array.isArray(driver)) return '';
            if (typeof driver === 'object' && driver !== null && field in driver) {
              const value = (driver as Record<string, unknown>)[field];
              return typeof value === 'string' ? value : '';
            }
            return '';
          };
          const tipoMaterial = excelIdToTipoMaterial[String(l.excel_id)] || "";
          let residuos = {};
          if (tipoMaterial === "Lodos") {
            residuos = {
              nombreResiduo: l.waste_name,
              manifiestoNo: l["Manifiesto No."],
              area: l.area,
              transporteNoServicios: l.transport_num_services,
              pesoKg: l.quantity,
            };
          } else if (tipoMaterial === "Metal") {
            residuos = {
              tipoResiduo: l.waste_type,
              item: l.waste_name,
              cantidad: l.quantity,
              unidad: l.quantity_type,
              remisionHMMX: l.REM ? String(l.REM) : undefined,
            };
          } else if (tipoMaterial === "Otros") {
            residuos = {
              tipoDesecho: l.waste_type,
              item: l.waste_name,
              cantidad: l.quantity,
              unidad: l.quantity_type,
              remisionHMMX: l.REM ? String(l.REM) : undefined,
            };
          } else if (tipoMaterial === "Destruidas") {
            residuos = {
              residuos: l.waste_name,
              area: l.area,
              peso: l.quantity,
            };
          }
          return {
            fecha: String(l.date || ''),
            horaSalida: String(l.departure_time || ''),
            folio: String(l.folio || ''),
            departamento: String(l.department || ''),
            motivo: String(l.reason || ''),
            nombreChofer: `${getDriverField('first_name')} ${getDriverField('last_name')}`.trim(),
            compania: getDriverField('company'),
            procedencia: getDriverField('origin'),
            destino: getDriverField('destination'),
            placas: getDriverField('vehicle_plate'),
            numeroEconomico: getDriverField('economic_number'),
            tipoMaterial,
            residuos,
            pesoTotal: String(l.quantity?.toString() || ''),
            tipoContenedor: String(l.container_type || ''),
            personaAutoriza: String(l.authorizing_person || ''),
          };
        }).filter((log: LogEntry) => !!log.fecha);
        setLogs(mappedLogs);
      } else {
        setError("Error loading logs from the database.");
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Aggregated data
  const wasteByType = useMemo(() => getWasteByType(logs, year), [logs, year]);
  const [selectedType, setSelectedType] = useState<string>(Object.keys(wasteByType)[0] || "Metal");
  const [selectedAvgType, setSelectedAvgType] = useState<string>(Object.keys(wasteByType)[0] || "Metal");
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

  if (loading) return (
    <div className="p-8 text-center flex flex-col items-center">
      <Loader />
      <span className="mt-4 text-lg">{tCommon('loading')}</span>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{tCommon('errorLoading')}</div>;

  return (
    <div>
      <DashboardHeader variant="dashboard" />
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-8">
        {/* Monthly Waste Progress - full width */}
        <DashboardCard title={<span className="flex items-center gap-2 text-2xl font-semibold text-blue-900"><FaChartBar className="text-blue-500" />{t('monthlyWasteProgress')}</span>} className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-8 flex flex-col justify-center h-full min-h-[260px] col-span-1 md:col-span-3">
          <div className="flex flex-col items-center gap-6 w-full">
            <span className="text-6xl font-extrabold text-blue-700">{monthlyTotal.toLocaleString()} <span className="text-2xl font-semibold">{tCommon('kg')}</span></span>
            <span className="text-base text-gray-500">{t('target', { amount: MONTHLY_TARGET.toLocaleString() })}</span>
            <div className="w-full max-w-2xl mx-auto">
              <Progress value={monthlyProgress} className="h-3 mt-4 bg-blue-100" />
            </div>
            <span className="text-base text-gray-400">{t('ofTarget', { percent: monthlyProgress.toFixed(1) })}</span>
          </div>
        </DashboardCard>
        {/* Waste by Type Pie Chart - bigger and better spaced */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaWeight className="text-green-500" />{t('wasteByType')}</span>} className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[260px]">
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
                  {t(`table.type`)}: {entry.name}: {entry.value.toLocaleString()} {tCommon('kg')}
                </span>
              ))}
            </div>
          </div>
        </DashboardCard>
        {/* Monthly Summary Widget */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900 mb-4"><FaChartBar className="text-yellow-500" />{t('monthlySummary')}</span>} className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-start h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-start h-full gap-6">
            <span className="text-5xl font-extrabold text-yellow-700">{logCountMonth}</span>
            <span className="text-base text-gray-700">{t('logsThisMonth')}</span>
            <span className="text-2xl font-bold text-yellow-700">{monthlyTotal.toLocaleString()} {tCommon('kg')}</span>
            <span className="text-base text-gray-700">{logCountMonth > 0 ? (monthlyTotal / logCountMonth).toLocaleString(undefined, { maximumFractionDigits: 1 }) : 0} {t('kgPerLog')}</span>
            {mostActiveDriver && (
              <span className="text-xs text-gray-500">{t('mostActiveDriver', { driver: mostActiveDriver.nombreChofer, count: mostActiveDriver.totalLogs })}</span>
            )}
          </div>
        </DashboardCard>
        {/* Monthly Waste Trend */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-indigo-500" />{t('monthlyWasteTrend')}</span>} className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[320px]">
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
              <span className="text-xs">{t('type')}</span>
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
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-gray-500" />{t('recentWasteLogs')}</span>} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-6 col-span-2 flex flex-col justify-between h-full min-h-[260px]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2">{t('table.number')}</th>
                  <th className="px-2">{t('table.type')}</th>
                  <th className="px-2">{t('table.date')}</th>
                  <th className="px-2">{t('table.amount')}</th>
                  <th className="px-2">{t('table.department')}</th>
                  <th className="px-2">{t('table.driver')}</th>
                  <th className="px-2">{t('table.details')}</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log: LogEntry, idx: number) => {
                  // Color by waste type
                  const typeColor = {
                    Metal: "bg-blue-500",
                    Otros: "bg-green-500",
                    Lodos: "bg-orange-400",
                    Destruidas: "bg-red-500",
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
                      <td className="px-2 py-2">{Number(log.pesoTotal).toLocaleString()} {tCommon('kg')}</td>
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
                            <Button variant="outline" size="sm" onClick={() => { setSelectedLog(log); setIsDialogOpen(true); }} className="text-primary bg-popover">{t('table.details')}</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-popover">
                            <div className="flex justify-between items-center mb-4">
                              <DialogTitle>{t('logDetails')}</DialogTitle>
                            </div>
                            <DialogHeader>
                              <DialogTitle>{t('logDetailsWithFolio', { folio: selectedLog?.folio || '' })}</DialogTitle>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-6 py-4">
                                {/* General Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.date')}</h3>
                                    <p>{formatDate(String(selectedLog?.fecha ?? ''))}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.departureTime')}</h3>
                                    <p>{selectedLog.horaSalida}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.folio')}</h3>
                                    <p>{selectedLog.folio}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.department')}</h3>
                                    <p>{selectedLog.departamento}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.reason')}</h3>
                                    <p>{selectedLog.motivo}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('generalInfo.authorizedBy')}</h3>
                                    <p>{selectedLog.personaAutoriza}</p>
                                  </div>
                                </div>
                                {/* Transport Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.driver')}</h3>
                                    <p>{selectedLog.nombreChofer}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.company')}</h3>
                                    <p>{selectedLog.compania}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.plates')}</h3>
                                    <p>{selectedLog.placas}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.economicNo')}</h3>
                                    <p>{selectedLog.numeroEconomico}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.origin')}</h3>
                                    <p>{selectedLog.procedencia}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('transportInfo.destination')}</h3>
                                    <p>{selectedLog.destino}</p>
                                  </div>
                                </div>
                                {/* Material and Container Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('materialInfo.materialType')}</h3>
                                    <p>{selectedLog.tipoMaterial}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('materialInfo.containerType')}</h3>
                                    <p>{selectedLog.tipoContenedor}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('materialInfo.totalWeight')}</h3>
                                    <p>
                                      {selectedLog.pesoTotal} {selectedLog.tipoMaterial === "Otros" || selectedLog.tipoMaterial === "Metal" ? ((selectedLog.residuos as MetalResiduo | OtrosResiduo)?.unidad || tCommon('kg')) : tCommon('kg')}
                                    </p>
                                  </div>
                                </div>
                                {/* Detailed Residues Section */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">{t('materialSpecificDetails')}</h3>
                                  {(() => {
                                    if (!selectedLog.residuos) return null;
                                    switch (selectedLog.tipoMaterial) {
                                      case "Lodos": {
                                        const details = selectedLog.residuos as LodosResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('lodos.residueName')}</h4>
                                              <p>{details.nombreResiduo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('lodos.manifestNo')}</h4>
                                              <p>{details.manifiestoNo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('lodos.area')}</h4>
                                              <p>{details.area || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('lodos.transportNoServices')}</h4>
                                              <p>{details.transporteNoServicios || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('lodos.weightKg')}</h4>
                                              <p>{details.pesoKg || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "Metal": {
                                        const details = selectedLog.residuos as MetalResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('metal.residueType')}</h4>
                                              <p>{details.tipoResiduo || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('metal.item')}</h4>
                                              <p>{details.item || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('metal.amount')}</h4>
                                              <p>{details.cantidad || "-"} {details.unidad || ""}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('metal.remisionHMMX')}</h4>
                                              <p>{details.remisionHMMX || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('metal.remisionKia')}</h4>
                                              <p>{details.remisionKia || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "Otros": {
                                        const details = selectedLog.residuos as OtrosResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('otros.wasteType')}</h4>
                                              <p>{details.tipoDesecho || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('otros.item')}</h4>
                                              <p>{details.item || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('otros.amount')}</h4>
                                              <p>{details.cantidad || "-"} {details.unidad || ""}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('otros.remisionHMMX')}</h4>
                                              <p>{details.remisionHMMX || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('otros.remisionKia')}</h4>
                                              <p>{details.remisionKia || "-"}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      case "Destruidas": {
                                        const details = selectedLog.residuos as DestruidasResiduo;
                                        return (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('destruidas.residues')}</h4>
                                              <p>{details.residuos || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('destruidas.area')}</h4>
                                              <p>{details.area || "-"}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-muted-foreground">{t('destruidas.weight')}</h4>
                                              <p>{details.peso || "-"} {tCommon('kg')}</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      default:
                                        return <p>{t('noDetails')}</p>;
                                    }
                                  })()}
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => selectedLog && generatePdf(selectedLog)}>
                                  <Download className="h-4 w-4" />
                                  {t('downloadPdf')}
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
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-pink-500" />{t('wasteByMaterialMonth')}</span>} className="bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full min-h-[320px]">
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
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900"><FaChartBar className="text-blue-400" />{t('wasteLogCount')}</span>} className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-evenly h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-evenly h-full gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{t('year')}</span>
              <span className="text-5xl font-extrabold text-blue-700">{logCountYear}</span>
              <span className="text-sm font-semibold text-blue-900">{t('logs')}</span>
            </div>
            <div className="w-2/3 h-px bg-blue-100 my-2" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{t('month')}</span>
              <span className="text-5xl font-extrabold text-blue-700">{logCountMonth}</span>
              <span className="text-sm font-semibold text-blue-900">{t('logs')}</span>
            </div>
          </div>
        </DashboardCard>
        {/* Average Waste per Log (with selector) */}
        <DashboardCard title={<span className="flex items-center gap-2 text-lg font-semibold text-blue-900 mb-4"><FaWeight className="text-green-500" />{t('averageWastePerLog')}</span>} className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 flex flex-col justify-start h-full min-h-[260px]">
          <div className="flex flex-col items-center justify-start h-full gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-green-900">{t('type')}</span>
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
            <span className="text-5xl font-extrabold text-green-700">{avgWastePerLog.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg font-semibold">{tCommon('kg')}</span></span>
            <span className="text-xs text-gray-500">{t('yearType', { year, type: selectedAvgType })}</span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}