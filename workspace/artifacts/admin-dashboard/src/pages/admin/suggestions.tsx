import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreSuggestions, approveStoreSuggestion, rejectStoreSuggestion, getGetStoreSuggestionsQueryKey } from "@workspace/api-client-react";
import { CheckCircle, XCircle, MapPin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "في الانتظار", color: "bg-amber-100 text-amber-800" },
  approved: { label: "مقبول", color: "bg-green-100 text-green-800" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
};

export default function Suggestions() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: getGetStoreSuggestionsQueryKey(),
    queryFn: getStoreSuggestions,
  });

  const approve = useMutation({
    mutationFn: (id: number) => approveStoreSuggestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getGetStoreSuggestionsQueryKey() }); toast({ title: "تم قبول الاقتراح" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: (id: number) => rejectStoreSuggestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getGetStoreSuggestionsQueryKey() }); toast({ title: "تم رفض الاقتراح" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">اقتراحات المحلات</h1>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Camera size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد اقتراحات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {suggestions.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {s.photoUrl ? (
                <img src={s.photoUrl} alt="صورة المحل" className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                  <Camera size={48} className="text-slate-300" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabels[s.status].color}`}>
                    {statusLabels[s.status].label}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="font-bold text-slate-800 text-base">{s.name}</p>
                  <p><span className="font-medium text-slate-500">الموزع:</span> <span className="text-slate-700">{s.distributorName}</span></p>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={14} />
                    <span>{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString("ar-DZ")}</p>
                </div>
                {s.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => approve.mutate(s.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                      <CheckCircle size={16} /> قبول
                    </button>
                    <button onClick={() => reject.mutate(s.id)}
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
    </div>
  );
}
