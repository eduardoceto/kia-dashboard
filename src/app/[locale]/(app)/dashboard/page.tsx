import { Calendar, CreditCard, Wallet } from "lucide-react"
import List01 from "@/src/components/list-01"
import List02 from "@/src/components/list-02"
import DashCard from "./components/dash-card"
import { VscGraph } from "react-icons/vsc";
import { SlGraph } from "react-icons/sl";
import { YearComparisonGraph } from "@/src/components/graphs/yearlyComparisonGraph";
import { StandaloneGraph } from "@/src/components/graphs/standAloneGraph";

export default function () {
  return (
    <div className="space-y-4">

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23] ">
          <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Calendar className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
              Progress
          </h2>
        </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23] ">
        <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
          Upcoming Logs
        </h2>
        <DashCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] overflow-auto">
          <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
            <VscGraph className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Monthly
          </h2>
          <div className="flex-1">
            {/* TODO: Graph */}
            <StandaloneGraph />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] overflow-auto">
          <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <SlGraph className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
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