import { useGetMe, useGetDashboardStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ListTodo, Map as MapIcon, PlusCircle, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DistributorHome() {
  const { data: user } = useGetMe();

  const menuItems = [
    { title: "مهامي اليوم", icon: ListTodo, href: "/distributor/tasks", color: "bg-blue-500", shadow: "shadow-blue-500/20" },
    { title: "خريطة المحلات", icon: MapIcon, href: "/distributor/map", color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
    { title: "اقتراح محل", icon: PlusCircle, href: "/distributor/suggest", color: "bg-orange-500", shadow: "shadow-orange-500/20" },
  ];

  return (
    <div className="space-y-6 pt-4">
      
      {/* Quick Stats (Mocked for generic dist logic, usually needs specific endpoint, using local mock logic based on user data if available) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
        <p className="text-slate-500 font-semibold mb-1">الأموال المحصلة</p>
        <h2 className="text-4xl font-display font-bold text-emerald-600 mb-6">
           --- د.ج
        </h2>
        
        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
          <div>
            <p className="text-slate-400 text-sm">المهام المنجزة</p>
            <p className="font-bold text-xl text-slate-800">--</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">الديون المحصلة</p>
            <p className="font-bold text-xl text-slate-800">--</p>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-xl text-slate-800 px-2 mt-8">الخدمات</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center justify-center gap-4 text-center h-40 ${item.shadow}`}
            >
              <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center text-white shadow-inner`}>
                <item.icon className="w-8 h-8" />
              </div>
              <span className="font-bold text-slate-800">{item.title}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
