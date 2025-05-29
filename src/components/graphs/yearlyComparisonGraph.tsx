"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Loader2 } from "lucide-react"

import { mockCombinedData } from "@/src/components/testData/data"
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { createClient } from "@/src/utils/supabase/client"

const MATERIALS = [
  "Metal/Non metallic",
  "Other Recycables",
  "Sludge",
  "Uretano",
  "Vidrio",
  "Autopartes Destruida"
]
const MATERIAL_TO_EXCEL_ID: Record<string, number[]> = {
  "Sludge": [1],
  "Uretano": [2],
  "Vidrio": [2],
  "Autopartes Destruida": [2],
  "Other Recycables": [3],
  "Metal/Non metallic": [4],
}

function GraphContainer({ loading, error, children }: { loading: boolean; error: string | null; children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="animate-spin w-12 h-12 text-muted-foreground" />
      </div>
    )
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }
  return <>{children}</>
}

function CombinedChart({
    data = mockCombinedData,
    height = "h-[500px]",
    showComparison,
    onShowComparisonChange,
    selectors,
    selectedYear,
  }: { title: string; data?: Record<string, any>[]; height?: string; showComparison: boolean; onShowComparisonChange: (val: boolean) => void; selectors?: React.ReactNode; selectedYear: number }) {
    const prevYear = selectedYear - 1;
    const kgKey = `kg/${selectedYear}`;
    const kgPrevKey = `kg/${prevYear}`;
    const kgVehicleKey = `kg/Vehicle (${selectedYear})`;
    const kgVehiclePrevKey = `kg/Vehicle (${prevYear})`;
    // Calculate max values for y-axis scaling
    const maxKg = Math.max(
      ...data.map((item) => Math.max(item[kgKey] || 0, showComparison ? item[kgPrevKey] || 0 : 0)),
    )
    const maxKgVehicle = Math.max(
      ...data.map((item) =>
        Math.max(item[kgVehicleKey] || 0, showComparison ? item[kgVehiclePrevKey] || 0 : 0),
      ),
    )
    return (
      <Card className="w-full rounded-md bg-[#fbfbfb] shadow-md">
        <CardHeader className="pb-2">
          <CardTitle> </CardTitle>
        </CardHeader>
        <CardContent>
          {selectors && (
            <div className="flex flex-col justify-between md:flex-row md:gap-12 gap-4 mb-6 items-stretch md:items-end w-full">
              {selectors}
            </div>
          )}
          <div className={`w-full ${height}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  label={{ value: "kg", angle: -90, position: "insideLeft" }}
                  domain={[0, maxKg * 1.1]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "kg/Vehicle", angle: 90, position: "insideRight" }}
                  domain={[0, maxKgVehicle * 1.1]}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const nameStr = String(name);
                    if (nameStr.includes("Vehicle")) {
                      return [`${value} kg/vehicle`, name]
                    }
                    return [`${value.toLocaleString()} kg`, name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey={kgKey}
                  name={kgKey}
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={showComparison ? 20 : 40}
                />
                {showComparison && (
                  <Bar
                    yAxisId="left"
                    dataKey={kgPrevKey}
                    name={kgPrevKey}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                )}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={kgVehicleKey}
                  name={kgVehicleKey}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {showComparison && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={kgVehiclePrevKey}
                    name={kgVehiclePrevKey}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  
  
  // Year-over-year comparison dashboard
export function YearComparisonGraph() {
  const [material, setMaterial] = useState(MATERIALS[0])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [data, setData] = useState<{ month: string; [key: string]: number | string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yearLoading, setYearLoading] = useState(true)
  const [yearError, setYearError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(true)

  useEffect(() => {
    // Fetch available years from waste_logs
    const fetchYears = async () => {
      setYearLoading(true)
      setYearError(null)
      try {
        const supabase = createClient()
        const { data: logs, error: logsErr } = await supabase
          .from('waste_logs')
          .select('created_at')
        if (logsErr) throw logsErr
        const yearSet = new Set<number>()
        logs?.forEach(l => {
          const d = new Date(l.created_at)
          yearSet.add(d.getFullYear())
        })
        const yearArr = Array.from(yearSet).sort((a, b) => b - a)
        setYears(yearArr)
        setSelectedYear(yearArr[0] || null)
      } catch (e: any) {
        setYearError(e.message || "Error fetching years")
      } finally {
        setYearLoading(false)
      }
    }
    fetchYears()
  }, [])

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    setError(null)
    const fetchData = async () => {
      try {
        const supabase = createClient()
        // Map material to excel_id(s)
        const excelIds = MATERIAL_TO_EXCEL_ID[material] || []
        // Calculate date range for selectedYear and previous year
        const startDate = `${selectedYear - 1}-01-01T00:00:00.000Z`;
        const endDate = `${selectedYear}-12-31T23:59:59.999Z`;
        // Fetch waste_logs for selected excel_id(s) and year, and previous year for comparison
        let query = supabase
          .from('waste_logs')
          .select('created_at, excel_id, quantity, quantity_type')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
        if (excelIds.length === 1) {
          query = query.eq('excel_id', excelIds[0])
        } else if (excelIds.length > 1) {
          query = query.in('excel_id', excelIds)
        }
        const { data: logs, error: logsErr } = await query
        if (logsErr) throw logsErr
        // Only use rows where quantity_type is 'kg'
        const filteredLogs = logs?.filter(l => l.quantity_type === 'kg') || []
        // Group by month for selected year and previous year
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ]
        const getMonth = (date: Date) => date.toLocaleString('default', { month: 'long' })
        const groupByYear = (year: number) => months.map((month) => {
          const sum = filteredLogs.filter(l => {
            const d = new Date(l.created_at)
            return d.getFullYear() === year && getMonth(d) === month
          }).reduce((acc, l) => acc + (l.quantity || 0), 0) || 0
          return sum
        })
        const dataThisYear = groupByYear(selectedYear)
        const dataPrevYear = groupByYear(selectedYear - 1)
        const combined = months.map((month, i) => ({
          month,
          [`kg/${selectedYear}`]: dataThisYear[i],
          [`kg/${selectedYear - 1}`]: dataPrevYear[i],
          [`kg/Vehicle (${selectedYear})`]: 0,
          [`kg/Vehicle (${selectedYear - 1})`]: 0,
        }))
        setData(combined)
      } catch (e: any) {
        setError(e.message || "Error fetching data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [material, selectedYear])

  if (yearLoading) return <div>Loading years...</div>
  if (yearError) return <div className="text-red-500">{yearError}</div>

  const selectors = (
    <>
      <div className="space-y-1 min-w-[200px] w-full md:w-auto">
        <label className="text-sm font-medium">Material</label>
        <Select value={material} onValueChange={setMaterial}>
          <SelectTrigger>
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            {MATERIALS.map((mat) => (
              <SelectItem key={mat} value={mat}>
                {mat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 min-w-[200px] w-full md:w-auto">
        <label className="text-sm font-medium">Year</label>
        <Select value={selectedYear?.toString() || ""} onValueChange={y => setSelectedYear(Number(y))}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 min-w-[200px] w-full md:w-auto">
        <label className="text-sm font-medium">Comparison</label>
        <Select value={showComparison ? "comparison" : "single"} onValueChange={v => setShowComparison(v === "comparison") }>
          <SelectTrigger>
            <SelectValue placeholder="Comparison mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comparison">Compare with {selectedYear ? selectedYear - 1 : "previous year"}</SelectItem>
            <SelectItem value="single">Show {selectedYear} only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <GraphContainer loading={loading} error={error}>
        {selectedYear ? (
          <CombinedChart
            title={`${material} ${selectedYear}`}
            data={data}
            height="h-[500px]"
            showComparison={showComparison}
            onShowComparisonChange={setShowComparison}
            selectors={selectors}
            selectedYear={selectedYear}
          />
        ) : null}
      </GraphContainer>
    </div>
  )
}