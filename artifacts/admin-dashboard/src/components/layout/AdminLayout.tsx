import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Users, Package, Store, 
  ListTodo, Truck, Lightbulb, Calculator, 
  Map, LogOut, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/distributors", label: "الموزعون", icon: Users },
  { href: "/products", label: "السلع", icon: Package },
  { href: "/stores", label: "المحلات", icon: Store },
  { href: "/tasks", label: "المهام", icon: ListTodo },
  { href: "/deliveries", label: "التوصيلات", icon: Truck },
  { href: "/suggestions", label: "الاقتراحات", icon: Lightbulb },
  { href: "/accounting", label: "المحاسبة", icon: Calculator },
  { href: "/map", label: "الخريطة الشاملة", icon: Map },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col",
        isMobileOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-sidebar-border/50">
          <img src="/brand-logo.png" alt="Tim & Tom" className="w-full h-auto rounded-xl shadow-lg shadow-black/20" />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-sidebar-active/10 text-sidebar-active shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-border hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50">
          <div className="bg-sidebar-border/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-border flex items-center justify-center">
                <span className="font-display font-bold text-white">{user?.firstName?.[0]}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-sidebar-foreground/60">مدير النظام</p>
              </div>
            </div>
            <button 
              onClick={() => logoutMutation.mutate()}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-30 lg:hidden">
          <div className="flex items-center gap-3">
            <img src="/brand-logo.png" alt="Tim & Tom" className="h-10 w-10 rounded-lg" />
          </div>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
