import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { DistributorLayout } from "@/components/layout/DistributorLayout";

import Login from "@/pages/login";
import Dashboard from "@/pages/admin/dashboard";
import Distributors from "@/pages/admin/distributors";
import Products from "@/pages/admin/products";
import Stores from "@/pages/admin/stores";
import Tasks from "@/pages/admin/tasks";
import Deliveries from "@/pages/admin/deliveries";
import Accounting from "@/pages/admin/accounting";
import MapPage from "@/pages/admin/map";
import Suggestions from "@/pages/admin/suggestions";

import DistributorHome from "@/pages/distributor/home";
import DistributorTasks from "@/pages/distributor/tasks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Redirect to={user.role === 'admin' ? "/" : "/distributor"} />;
  }

  if (user.role === 'admin') {
    return <AdminLayout><Component /></AdminLayout>;
  } else {
    return <DistributorLayout><Component /></DistributorLayout>;
  }
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-slate-50" />;

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to={user.role === 'admin' ? "/" : "/distributor"} /> : <Login />}
      </Route>

      <Route path="/" component={() => <ProtectedRoute component={Dashboard} allowedRole="admin" />} />
      <Route path="/distributors" component={() => <ProtectedRoute component={Distributors} allowedRole="admin" />} />
      <Route path="/products" component={() => <ProtectedRoute component={Products} allowedRole="admin" />} />
      <Route path="/stores" component={() => <ProtectedRoute component={Stores} allowedRole="admin" />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={Tasks} allowedRole="admin" />} />
      <Route path="/deliveries" component={() => <ProtectedRoute component={Deliveries} allowedRole="admin" />} />
      <Route path="/accounting" component={() => <ProtectedRoute component={Accounting} allowedRole="admin" />} />
      <Route path="/map" component={() => <ProtectedRoute component={MapPage} allowedRole="admin" />} />
      <Route path="/suggestions" component={() => <ProtectedRoute component={Suggestions} allowedRole="admin" />} />

      <Route path="/distributor" component={() => <ProtectedRoute component={DistributorHome} allowedRole="distributor" />} />
      <Route path="/distributor/tasks" component={() => <ProtectedRoute component={DistributorTasks} allowedRole="distributor" />} />
      <Route path="/distributor/map" component={() => <ProtectedRoute component={() => (
        <div className="p-6 text-center text-slate-500 font-semibold mt-20">جاري تحميل الخريطة...</div>
      )} allowedRole="distributor" />} />
      <Route path="/distributor/suggest" component={() => <ProtectedRoute component={() => (
        <div className="p-6 text-center text-slate-500 font-semibold mt-20">نموذج اقتراح محل...</div>
      )} allowedRole="distributor" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
