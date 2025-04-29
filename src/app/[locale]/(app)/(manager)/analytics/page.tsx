import { BarChart4, LineChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useTranslations } from "next-intl"; // Import useTranslations

import { YearComparisonGraph } from "@/src/components/graphs/yearlyComparisonGraph"
import { MultiGraphPanel } from "@/src/components/graphs/multiGraphPanel"


export default function UnifiedWasteDashboard() {
  const t = useTranslations('analyticsPage'); // Initialize translations

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        {/* Use translation key */}
        <h1 className="text-2xl KiaSignatureBold">{t('title')}</h1>
      </div>

      <Tabs defaultValue="multi-graph" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-accent-foreground">
          <TabsTrigger
            value="multi-graph"
            className="flex items-center gap-2 bg-accent-foreground text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-foreground"
          >
            <BarChart4 className="h-4 w-4" />
            <span>{t('multiGraphTab')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="year-comparison"
            className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-foreground"
          >
            <LineChart className="h-4 w-4" />
            <span>{t('yearComparisonTab')}</span>
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
