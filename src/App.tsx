import { useEffect } from "react";
import { useAuthStore } from "./stores/auth-store";
import { useThemeStore } from "./stores/theme-store";
import { LockScreen } from "./components/auth/lock-screen";
import { SetupScreen } from "./components/auth/setup-screen";
import { MainLayout } from "./components/layout/main-layout";

export default function App() {
  const { isUnlocked, hasPassword, isLoading, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{
            borderWidth: "2px",
            borderColor: "var(--border-color)",
            borderTopColor: "var(--accent)",
          }}
        />
      </div>
    );
  }

  if (!hasPassword) {
    return <SetupScreen />;
  }

  if (!isUnlocked) {
    return <LockScreen />;
  }

  return <MainLayout />;
}
