import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, Map as MapIcon, ListTodo, PlusCircle, LogOut, Package
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DistributorLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 rounded-b-3xl shadow-lg shadow-primary/20 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-display font-bold text-2xl">تطبيق الموزع</h1>
          <button onClick={() => logoutMutation.mutate()} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-white text-primary flex items-center justify-center font-bold text-xl">
            {user?.firstName?.[0]}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-primary-foreground/80 text-sm">جاهز للعمل اليوم!</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 w-full max-w-lg mx-auto overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-border/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe z-40">
        <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-3">
          <NavButton href="/distributor" icon={Home} label="الرئيسية" active={location === "/distributor"} />
          <NavButton href="/distributor/tasks" icon={ListTodo} label="المهام" active={location.includes("/distributor/tasks")} />
          <NavButton href="/distributor/map" icon={MapIcon} label="الخريطة" active={location.includes("/distributor/map")} />
          <NavButton href="/distributor/suggest" icon={PlusCircle} label="اقتراح" active={location.includes("/distributor/suggest")} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
      active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
    )}>
      <Icon className={cn("w-6 h-6", active && "fill-primary/20")} />
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
