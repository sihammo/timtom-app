import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { login, logout, getMe, getGetMeQueryKey, User, LoginRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useAuthLogin>;
  logoutMutation: ReturnType<typeof useAuthLogout>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: getGetMeQueryKey(),
    queryFn: () => getMe(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(getGetMeQueryKey(), data.user);
      if (data.user.role === 'admin') {
        setLocation("/");
      } else {
        setLocation("/distributor");
      }
      toast({ title: "تم تسجيل الدخول بنجاح" });
    },
    onError: (error: any) => {
      let description = "تأكد من بيانات الدخول";
      if (error.response?.status === 401) {
        description = "اسم المستخدم أو كلمة المرور غير صحيحة";
      } else if (error.response?.status === 403) {
        description = "تم تعطيل هذا الحساب";
      } else if (!error.response) {
        description = "لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الـ API";
      }
      toast({ title: "فشل تسجيل الدخول", description, variant: "destructive" });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation("/login");
    }
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, loginMutation, logoutMutation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// Hooks aliases for ease
function useAuthLogin() { return useMutation({ mutationFn: (data: LoginRequest) => login(data) }); }
function useAuthLogout() { return useMutation({ mutationFn: () => logout() }); }
