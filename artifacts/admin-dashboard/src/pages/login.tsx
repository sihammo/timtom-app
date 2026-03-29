import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { loginMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10 border border-white/50"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">مرحباً بك مجدداً</h1>
          <p className="text-slate-500">سجل دخولك للمتابعة إلى نظام إدارة التوزيع</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="admin أو user"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed mt-4"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                تسجيل الدخول
                <ArrowLeft className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
