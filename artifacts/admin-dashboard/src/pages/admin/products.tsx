import { useState } from "react";
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Plus, Edit2, CircleAlert, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { data: products, isLoading } = useGetProducts();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-bold">إدارة المخزون والسلع</h1>
          <p className="text-slate-500">تتبع السلع المتوفرة وإضافة منتجات جديدة</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة سلعة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden">
            {prod.isLowStock && (
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-2 -right-6 w-24 bg-rose-500 text-white text-[10px] font-bold text-center py-1 transform rotate-45">
                  منخفض
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary">
                <CircleAlert className="w-6 h-6" />
              </div>
              <button onClick={() => setEditingProd(prod)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-1">{prod.name}</h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">سعر الشراء</span>
                <span className="font-bold text-slate-700">{formatCurrency(prod.purchasePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">سعر البيع</span>
                <span className="font-bold text-emerald-600">{formatCurrency(prod.sellPrice)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-500">الكمية المتوفرة</span>
                <Badge variant={prod.isLowStock ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                  {prod.quantity}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateProductModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {editingProd && <EditProductModal prod={editingProd} isOpen={true} onClose={() => setEditingProd(null)} />}
    </div>
  );
}

function CreateProductModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      purchasePrice: Number(fd.get('purchasePrice')),
      sellPrice: Number(fd.get('sellPrice')),
      quantity: Number(fd.get('quantity')),
      lowStockThreshold: Number(fd.get('lowStockThreshold')) || 10,
    };
    
    createMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        toast({ title: "تم الإضافة بنجاح" });
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة سلعة جديدة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold">اسم السلعة</label>
          <input name="name" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">سعر الشراء</label>
            <input type="number" step="0.01" name="purchasePrice" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">سعر البيع</label>
            <input type="number" step="0.01" name="sellPrice" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">الكمية</label>
            <input type="number" name="quantity" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">حد المخزون المنخفض</label>
            <input type="number" name="lowStockThreshold" defaultValue="10" className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <button disabled={createMutation.isPending} className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary/90 mt-4 disabled:opacity-50">
          إضافة
        </button>
      </form>
    </Modal>
  );
}

function EditProductModal({ prod, isOpen, onClose }: { prod: Product, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useUpdateProduct();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      purchasePrice: Number(fd.get('purchasePrice')),
      sellPrice: Number(fd.get('sellPrice')),
      quantity: Number(fd.get('quantity')),
      lowStockThreshold: Number(fd.get('lowStockThreshold')),
    };
    
    updateMutation.mutate({ id: prod.id, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        toast({ title: "تم التعديل بنجاح" });
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل السلعة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold">اسم السلعة</label>
          <input name="name" defaultValue={prod.name} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">سعر الشراء</label>
            <input type="number" step="0.01" name="purchasePrice" defaultValue={prod.purchasePrice} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">سعر البيع</label>
            <input type="number" step="0.01" name="sellPrice" defaultValue={prod.sellPrice} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">الكمية</label>
            <input type="number" name="quantity" defaultValue={prod.quantity} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">حد المخزون المنخفض</label>
            <input type="number" name="lowStockThreshold" defaultValue={prod.lowStockThreshold} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <button disabled={updateMutation.isPending} className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary/90 mt-4 disabled:opacity-50">
          حفظ التعديلات
        </button>
      </form>
    </Modal>
  );
}
