import { Calendar, CreditCard, Wallet } from "lucide-react"
import List01 from "./list-01"
import List02 from "./list-02"

function Content() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
          Upcoming Events
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
            <Wallet className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Accounts
          </h2>
          <div className="flex-1">
            <List01 className="KiaSignature h-full" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="KiaSignature text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <CreditCard className="KiaSignature w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Recent Transactions
          </h2>
          <div className="flex-1">
            <List02 className="KiaSignature h-full" />
          </div>
        </div>
      </div>

      
    </div>
  )
}

export default Content;
