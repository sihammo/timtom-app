import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapLocations, getGetMapLocationsQueryKey } from "@workspace/api-client-react";

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const { data } = useQuery({
    queryKey: getGetMapLocationsQueryKey(),
    queryFn: getMapLocations,
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!).setView([36.7525, 3.0420], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const storeIcon = L.divIcon({
        html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [16, 16],
        className: "",
      });
      const distIcon = L.divIcon({
        html: '<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [16, 16],
        className: "",
      });

      if (data) {
        data.stores.forEach((s: any) => {
          L.marker([s.latitude, s.longitude], { icon: storeIcon })
            .bindPopup(`<div dir="rtl"><b>${s.name}</b><br>دين: ${s.debt?.toLocaleString("ar-DZ")} دج</div>`)
            .addTo(map);
        });

        data.distributors.forEach((d: any) => {
          if (d.latitude && d.longitude) {
            L.marker([d.latitude, d.longitude], { icon: distIcon })
              .bindPopup(`<div dir="rtl"><b>${d.name}</b><br>الحالة: ${d.isActive ? "نشط" : "غير نشط"}</div>`)
              .addTo(map);
          }
        });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div dir="rtl" className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">الخريطة الشاملة</h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow" />
            <span className="text-slate-600">المحلات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow" />
            <span className="text-slate-600">الموزعون</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
      </div>
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{data.stores.length}</p>
            <p className="text-sm text-slate-600">محل</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
            <p className="text-2xl font-bold text-green-600">{data.distributors.filter((d: any) => d.latitude).length}</p>
            <p className="text-sm text-slate-600">موزع نشط في الخريطة</p>
          </div>
        </div>
      )}
    </div>
  );
}
