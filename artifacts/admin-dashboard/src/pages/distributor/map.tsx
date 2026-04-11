import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapLocations, getGetMapLocationsQueryKey } from "@workspace/api-client-react";

export default function DistributorMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: getGetMapLocationsQueryKey(),
    queryFn: getMapLocations,
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // Set center to Algiers
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

      if (data) {
        data.stores.forEach((s: any) => {
          L.marker([s.latitude, s.longitude], { icon: storeIcon })
            .bindPopup(`<div dir="rtl" class="font-sans"><b>${s.name}</b><br>${s.address}</div>`)
            .addTo(map);
        });
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          L.circle([latitude, longitude], {
            radius: 100,
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.3
          }).addTo(map);
          
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: '<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 4px rgba(34,197,94,0.3)"></div>',
              iconSize: [12, 12],
              className: "animate-pulse"
            })
          }).addTo(map);

          map.setView([latitude, longitude], 14);
        });
      }

      // Important: fix gray/white map issue by invalidating size
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-400">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-xl font-bold text-slate-800">خريطة المحلات</h1>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-slate-600">المحلات</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-600">موقعك الآن</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[500px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
