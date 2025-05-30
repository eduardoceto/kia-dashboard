"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { PlusCircle } from "lucide-react"
import { UniqueGraph } from "./uniqueGraph"
import { useTranslations } from "next-intl"


export function MultiGraphPanel() {
    const [graphs, setGraphs] = useState([0]) // Start with one graph
    const [nextId, setNextId] = useState(1)
    const [gridCols, setGridCols] = useState("md:grid-cols-1")
    const t = useTranslations('analyticsPage');
  
    // Update grid columns based on number of graphs
    useEffect(() => {
      if (graphs.length === 1) {
        setGridCols("md:grid-cols-1") // Single graph takes full width
      } else {
        setGridCols("md:grid-cols-2") // All other cases use 2 columns max
      }
    }, [graphs.length])
  
    const addGraph = () => {
      setGraphs([...graphs, nextId])
      setNextId(nextId + 1)
    }
  
    const removeGraph = (id: number) => {
      setGraphs(graphs.filter((graphId) => graphId !== id))
    }
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={addGraph} className="flex items-center gap-1 ml-auto bg-card hover:text-white">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
  
        <div className={`grid gap-4 ${gridCols}`}>
          {graphs.map((id) => (
            <UniqueGraph key={id} id={id} onRemove={removeGraph} totalGraphs={graphs.length} />
          ))}
        </div>
  
        {graphs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('noGraphs')}
            </p>
            <Button variant="outline" onClick={addGraph} className="mt-4 flex items-center gap-1 mx-auto bg-card hover:text-white">
              <PlusCircle className="h-4 w-4 mr-1" />
              {t('addGraph')}
            </Button>
          </div>
        )}
      </div>
    )
  }