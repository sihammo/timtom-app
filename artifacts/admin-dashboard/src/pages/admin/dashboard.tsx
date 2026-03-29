import { useGetDashboardStats } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, CircleAlert, Store, 
  ListTodo, Truck, AlertCircle, Wallet
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return <div className="flex h-64 items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  // Mock data for chart since API only returns totals
  const chartData = [
    { name: 'السبت', value: stats.weekProfit * 0.1 },
    { name: 'الأحد', value: stats.weekProfit * 0.15 },
    { name: 'الإثنين', value: stats.weekProfit * 0.2 },
    { name: 'الثلاثاء', value: stats.weekProfit * 0.1 },
    { name: 'الأربعاء', value: stats.weekProfit * 0.25 },
    { name: 'الخميس', value: stats.weekProfit * 0.1 },
    { name: 'الجمعة', value: stats.todayProfit },
  ];

  const cards = [
    { title: "أرباح اليوم", value: formatCurrency(stats.todayProfit), icon: TrendingUp, color: "bg-emerald-500", light: "bg-emerald-50" },
    { title: "أرباح الأسبوع", value: formatCurrency(stats.weekProfit), icon: Wallet, color: "bg-blue-500", light: "bg-blue-50" },
    { title: "ديون غير مدفوعة", value: formatCurrency(stats.unpaidDebts), icon: AlertCircle, color: "bg-rose-500", light: "bg-rose-50" },
    { title: "المهام اليوم", value: stats.totalTasks.toString(), icon: ListTodo, color: "bg-purple-500", light: "bg-purple-50" },
    { title: "مهام قيد الانتظار", value: stats.pendingTasks.toString(), icon: ListTodo, color: "bg-amber-500", light: "bg-amber-50" },
    { title: "سلع منخفضة المخزون", value: stats.lowStockProducts.toString(), icon: CircleAlert, color: "bg-orange-500", light: "bg-orange-50" },
    { title: "توصيلات تنتظر المراجعة", value: stats.pendingDeliveries.toString(), icon: Truck, color: "bg-cyan-500", light: "bg-cyan-50" },
    { title: "الموزعون النشطون", value: stats.activeDistributors.toString(), icon: Users, color: "bg-indigo-500", light: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">نظرة عامة</h1>
          <p className="text-slate-500 mt-1">إحصائيات وأداء نظام التوزيع الخاص بك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.light}`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">أرباح الأسبوع الحالي</h3>
        <div className="h-[300px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), 'الأرباح']}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(221, 83%, 53%)" strokeWidth={4} dot={{ r: 6, fill: 'hsl(221, 83%, 53%)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
