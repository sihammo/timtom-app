import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccountingSummary, getStoreDebts, getDistributorDebts, settleDistributorAccount,
  getGetAccountingSummaryQueryKey, getGetStoreDebtsQueryKey, getGetDistributorDebtsQueryKey
} from "@workspace/api-client-react";
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Accounting() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [settleDistId, setSettleDistId] = useState<number | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleNotes, setSettleNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"stores" | "distributors">("stores");

  const { data: summary } = useQuery({
    queryKey: [...getGetAccountingSummaryQueryKey(), period],
    queryFn: () => getAccountingSummary({ period }),
  });

  const { data: storeDebts = [] } = useQuery({
    queryKey: getGetStoreDebtsQueryKey(),
    queryFn: getStoreDebts,
  });

  const { data: distributorDebts = [] } = useQuery({
    queryKey: getGetDistributorDebtsQueryKey(),
    queryFn: getDistributorDebts,
  });

  const settle = useMutation({
    mutationFn: ({ id, amount, notes }: { id: number; amount: number; notes: string }) =>
      settleDistributorAccount(id, { amount, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetDistributorDebtsQueryKey() });
      setSettleDistId(null); setSettleAmount(""); setSettleNotes("");
      toast({ title: "تم تصفية الحساب بنجاح" });
    },
    onError: () => toast({ title: "خطأ في تصفية الحساب", variant: "destructive" }),
  });

  const periodLabels = { day: "اليوم", week: "الأسبوع", month: "الشهر" };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">المحاسبة والأرباح</h1>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الإيرادات", value: summary.totalRevenue, color: "text-blue-600", bg: "bg-blue-50", icon: DollarSign },
            { label: "إجمالي الأرباح", value: summary.totalProfit, color: "text-green-600", bg: "bg-green-50", icon: TrendingUp },
            { label: "ديون المحلات", value: summary.totalStoreDebts, color: "text-orange-600", bg: "bg-orange-50", icon: Building2 },
            { label: "ديون الموزعين", value: summary.totalDistributorDebts, color: "text-red-600", bg: "bg-red-50", icon: Users },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <Icon size={20} className={color} />
                <p className="text-sm text-slate-600">{label}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString("ar-DZ")}</p>
              <p className="text-xs text-slate-400 mt-1">دج</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab("stores")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "stores" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
            ديون المحلات ({storeDebts.length})
          </button>
          <button onClick={() => setActiveTab("distributors")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "distributors" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
            ديون الموزعين ({distributorDebts.length})
          </button>
        </div>

        <div className="p-4">
          {activeTab === "stores" ? (
            storeDebts.length === 0 ? (
              <p className="text-center py-10 text-slate-400">لا توجد ديون</p>
            ) : (
              <div className="space-y-3">
                {storeDebts.map(s => (
                  <div key={s.storeId} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div>
                      <p className="font-semibold text-slate-800">{s.storeName}</p>
                      <p className="text-sm text-slate-500">{s.ownerName} · {s.phone}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-orange-600">{s.debt.toLocaleString("ar-DZ")}</p>
                      <p className="text-xs text-slate-400">دج</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            distributorDebts.length === 0 ? (
              <p className="text-center py-10 text-slate-400">لا توجد ديون</p>
            ) : (
              <div className="space-y-3">
                {distributorDebts.map(d => (
                  <div key={d.distributorId} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="font-semibold text-slate-800">{d.distributorName}</p>
                      <p className="text-sm text-slate-500">{d.phone}</p>
                      <p className="text-xs text-slate-400 mt-1">محصل: {d.totalCollected.toLocaleString("ar-DZ")} دج</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-lg font-bold text-red-600">{d.debt.toLocaleString("ar-DZ")}</p>
                        <p className="text-xs text-slate-400">دج متبقي</p>
                      </div>
                      <button onClick={() => setSettleDistId(d.distributorId)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors">
                        <CheckCircle size={14} /> تصفية
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {settleDistId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" dir="rtl">
            <h2 className="text-xl font-bold mb-4 text-slate-800">تصفية حساب الموزع</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">المبلغ (دج)</label>
                <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">ملاحظات</label>
                <textarea value={settleNotes} onChange={e => setSettleNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 min-h-[80px] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => settle.mutate({ id: settleDistId!, amount: parseFloat(settleAmount), notes: settleNotes })}
                disabled={!settleAmount || isNaN(parseFloat(settleAmount))}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors">
                تأكيد التصفية
              </button>
              <button onClick={() => { setSettleDistId(null); setSettleAmount(""); setSettleNotes(""); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
