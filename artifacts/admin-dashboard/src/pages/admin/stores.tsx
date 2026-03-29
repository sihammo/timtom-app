import { useState, useRef } from "react";
import { useGetStores, useCreateStore, useUpdateStore, Store } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Plus, Edit2, MapPin, Store as StoreIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function Stores() {
  const { data: stores, isLoading } = useGetStores();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-bold">إدارة المحلات</h1>
          <p className="text-slate-500">سجل المحلات التجارية ومواقعها وديونها</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة محل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores?.map((store) => (
          <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
                  <p className="text-sm text-slate-500">{store.ownerName}</p>
                </div>
              </div>
              <button onClick={() => setEditingStore(store)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 mt-4 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold w-16">الهاتف:</span>
                <span dir="ltr">{store.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold w-16">الديون:</span>
                <span className="font-bold text-rose-600">{formatCurrency(store.debt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold w-16">الزيارات:</span>
                <span>{store.totalVisits}</span>
              </div>
              {store.lastVisit && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold w-16">الزيارة:</span>
                  <span>{formatDate(store.lastVisit)}</span>
                </div>
              )}
            </div>

            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`} 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-semibold text-sm"
            >
              <MapPin className="w-4 h-4" />
              عرض على الخريطة
            </a>
          </div>
        ))}
      </div>

      <StoreModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {editingStore && <StoreModal store={editingStore} isOpen={true} onClose={() => setEditingStore(null)} />}
    </div>
  );
}

function LocationPicker({ pos, setPos }: { pos: [number, number], setPos: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={pos} />;
}

function StoreModal({ store, isOpen, onClose }: { store?: Store, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  
  // Default to Algiers center
  const [position, setPosition] = useState<[number, number]>(
    store ? [store.latitude, store.longitude] : [36.7525, 3.04197]
  );
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      ownerName: fd.get('ownerName') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      latitude: position[0],
      longitude: position[1],
    };
    
    if (store) {
      updateMutation.mutate({ id: store.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
          toast({ title: "تم التعديل بنجاح" });
          onClose();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
          toast({ title: "تم الإضافة بنجاح" });
          onClose();
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={store ? "تعديل المحل" : "إضافة محل جديد"} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">اسم المحل</label>
            <input name="name" defaultValue={store?.name} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">اسم المالك</label>
            <input name="ownerName" defaultValue={store?.ownerName} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">رقم الهاتف</label>
            <input name="phone" dir="ltr" defaultValue={store?.phone} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-right" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">العنوان (اختياري)</label>
            <input name="address" defaultValue={store?.address || ''} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold">حدد الموقع على الخريطة</label>
          <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
            <MapContainer center={position} zoom={12} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker pos={position} setPos={setPosition} />
            </MapContainer>
          </div>
          <p className="text-xs text-slate-500">اضغط على الخريطة لتحديد موقع المحل بدقة</p>
        </div>

        <button disabled={isPending} className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary/90 mt-4 disabled:opacity-50">
          {store ? "حفظ التعديلات" : "إضافة المحل"}
        </button>
      </form>
    </Modal>
  );
}
