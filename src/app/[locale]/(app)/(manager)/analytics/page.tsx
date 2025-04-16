import { BarChart4, LineChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"

import { YearComparisonGraph } from "@/src/components/graphs/yearlyComparisonGraph"
import { MultiGraphPanel } from "@/src/components/graphs/multiGraphPanel"


export default function UnifiedWasteDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Waste Disposal Analysis Dashboard</h1>
      </div>

      <Tabs defaultValue="multi-graph" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="multi-graph" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Multi-Graph View</span>
          </TabsTrigger>
          <TabsTrigger value="year-comparison" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Year Comparison</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="multi-graph">
          <MultiGraphPanel />
        </TabsContent>
        <TabsContent value="year-comparison">
          <YearComparisonGraph />
        </TabsContent>
      </Tabs>
    </div>
  )
}
