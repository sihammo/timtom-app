import { useState } from "react";
import { useGetDistributors, useCreateDistributor, useUpdateDistributor, useDeleteDistributor, Distributor } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Distributors() {
  const { data: distributors, isLoading } = useGetDistributors();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDist, setEditingDist] = useState<Distributor | null>(null);
  const deleteMutation = useDeleteDistributor();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الموزع نهائياً؟ سيتم منعه من استخدام التطبيق فوراً.")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/distributors'] });
          toast({ title: "تم حذف الموزع بنجاح" });
        }
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-bold">إدارة الموزعين</h1>
          <p className="text-slate-500">أضف وعَدّل بيانات الموزعين وتتبع أداءهم</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة موزع
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">المهام المنجزة</th>
                <th className="p-4">الديون</th>
                <th className="p-4">آخر ظهور</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributors?.map((dist) => (
                <tr key={dist.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{dist.firstName} {dist.lastName}</td>
                  <td className="p-4 text-slate-600" dir="ltr">{dist.username}</td>
                  <td className="p-4 text-slate-600" dir="ltr">{dist.phone}</td>
                  <td className="p-4">
                    <Badge variant={dist.isActive ? "success" : "destructive"}>
                      {dist.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-900">{dist.totalTasksCompleted}</td>
                  <td className="p-4 font-bold text-rose-600">{formatCurrency(dist.debt)}</td>
                  <td className="p-4 text-sm text-slate-500">{formatDate(dist.lastSeen)}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button onClick={() => setEditingDist(dist)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dist.id)} 
                      disabled={deleteMutation.isPending}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {distributors?.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">لا يوجد موزعون حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateDistributorModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {editingDist && <EditDistributorModal dist={editingDist} isOpen={true} onClose={() => setEditingDist(null)} />}
    </div>
  );
}

function CreateDistributorModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateDistributor();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate(
      { data: Object.fromEntries(fd) as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/distributors'] });
          toast({ title: "تم الإضافة بنجاح" });
          onClose();
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موزع جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">الاسم الأول</label>
            <input name="firstName" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">الاسم الأخير</label>
            <input name="lastName" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">رقم الهاتف</label>
          <input name="phone" dir="ltr" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-right" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">اسم المستخدم</label>
          <input name="username" dir="ltr" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-right" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">كلمة المرور</label>
          <input name="password" type="password" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>
        <button disabled={createMutation.isPending} className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary/90 mt-4 disabled:opacity-50">
          إضافة
        </button>
      </form>
    </Modal>
  );
}

function EditDistributorModal({ dist, isOpen, onClose }: { dist: Distributor, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useUpdateDistributor();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd);
    data.isActive = data.isActive === 'true';
    if (!data.password) delete data.password;

    updateMutation.mutate(
      { id: dist.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/distributors'] });
          toast({ title: "تم التعديل بنجاح" });
          onClose();
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل الموزع">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">الاسم الأول</label>
            <input name="firstName" defaultValue={dist.firstName} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">الاسم الأخير</label>
            <input name="lastName" defaultValue={dist.lastName} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">رقم الهاتف</label>
          <input name="phone" dir="ltr" defaultValue={dist.phone} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-right" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">كلمة المرور (اختياري للتغيير)</label>
          <input name="password" type="password" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block">الحالة</label>
          <select name="isActive" defaultValue={dist.isActive ? "true" : "false"} className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-primary outline-none">
            <option value="true">نشط</option>
            <option value="false">غير نشط</option>
          </select>
        </div>
        <button disabled={updateMutation.isPending} className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary/90 mt-4 disabled:opacity-50">
          حفظ التعديلات
        </button>
      </form>
    </Modal>
  );
}
