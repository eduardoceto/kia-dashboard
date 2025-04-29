import { Calendar, CreditCard, Wallet } from "lucide-react"
import DashCard from "./components/dash-card"
import { VscGraph } from "react-icons/vsc";
import { SlGraph } from "react-icons/sl";
import { FaBarsProgress } from "react-icons/fa6";

import { YearComparisonGraph } from "@/src/components/graphs/yearlyComparisonGraph";
import { StandaloneGraph } from "@/src/components/graphs/standAloneGraph";
import Divider from '@mui/material/Divider';




export default function () {
  return (
    <div className="space-y-4 bg-background">

      <div className="rounded-xl p-6 flex flex-col items-start justify-start">
        <h2 className="KiaSignatureBold text-lg font-bold text-foreground  mb-4 text-left flex items-center gap-2">
          <FaBarsProgress className="w-3.5 h-3.5 text-foreground" />
            Progress
        </h2>
      </div>

        <Divider variant="middle" className="text-foreground"/>

      <div className="rounded-xl p-6 flex flex-col items-start justify-start ">
        <h2 className="KiaSignatureBold text-lg font-bold text-foreground mb-4 text-left flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-foreground" />
          Upcoming Logs
        </h2>
        <DashCard />
      </div>

      <Divider variant="middle" className="text-foreground"/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 flex flex-col overflow-auto">
          <h2 className="KiaSignatureBold text-lg font-bold text-foreground mb-4 text-left flex items-center gap-2 ">
            <VscGraph className="w-3.5 h-3.5 text-foreground" />
            Monthly
          </h2>
          <div className="flex-1">
            {/* TODO: Graph */}
            <StandaloneGraph />
          </div>
        </div>

        <div className="rounded-xl p-6 flex flex-col  overflow-auto">
          <h2 className="KiaSignatureBold text-lg font-bold text-foreground mb-4 text-left flex items-center gap-2">
            <SlGraph className="w-3.5 h-3.5 text-foreground" />
            Yearly
          </h2>
          <div className="flex-1">
            {/* TODO: Graph */}
            <YearComparisonGraph />
          </div>
        </div>
      </div>

      
    </div>
  )
}