import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeliveries, confirmDelivery, rejectDelivery, getGetDeliveriesQueryKey } from "@workspace/api-client-react";
import { CheckCircle, XCircle, MapPin, Clock, Camera, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_admin: { label: "في انتظار التأكيد", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "مؤكد", color: "bg-green-100 text-green-800" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
};

export default function Deliveries() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("pending_admin");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: [...getGetDeliveriesQueryKey(), filter],
    queryFn: () => getDeliveries({ status: filter as any }),
  });

  const confirm = useMutation({
    mutationFn: (id: number) => confirmDelivery(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getGetDeliveriesQueryKey() }); toast({ title: "تم تأكيد التوصيل" }); },
    onError: () => toast({ title: "خطأ في التأكيد", variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectDelivery(id, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetDeliveriesQueryKey() });
      setRejectId(null);
      setRejectReason("");
      toast({ title: "تم رفض التوصيل" });
    },
    onError: () => toast({ title: "خطأ في الرفض", variant: "destructive" }),
  });

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">مراجعة التوصيلات</h1>
        <div className="flex gap-2">
          {["pending_admin", "confirmed", "rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {statusLabels[s].label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Camera size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد توصيلات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {deliveries.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {d.photoUrl ? (
                <img src={d.photoUrl} alt="صورة التوصيل" className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                  <Camera size={48} className="text-slate-300" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabels[d.status].color}`}>
                    {statusLabels[d.status].label}
                  </span>
                  <span className="text-xs text-slate-400">#{d.id}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p><span className="font-semibold text-slate-600">الموزع:</span> <span className="text-slate-800">{d.distributorName}</span></p>
                  <p><span className="font-semibold text-slate-600">المحل:</span> <span className="text-slate-800">{d.storeName}</span></p>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock size={14} />
                    <span>{new Date(d.deliveredAt).toLocaleString("ar-DZ")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={14} />
                    <span>{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-700 font-bold">
                    <DollarSign size={14} />
                    <span>{d.amountCollected.toLocaleString("ar-DZ")} دج</span>
                  </div>
                </div>
                {d.status === "pending_admin" && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => confirm.mutate(d.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                      <CheckCircle size={16} /> تأكيد
                    </button>
                    <button onClick={() => setRejectId(d.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                      <XCircle size={16} /> رفض
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" dir="rtl">
            <h2 className="text-xl font-bold mb-4 text-slate-800">سبب الرفض</h2>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 min-h-[100px] resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason })}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-colors">
                تأكيد الرفض
              </button>
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
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
