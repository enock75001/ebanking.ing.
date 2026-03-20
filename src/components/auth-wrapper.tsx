"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

// Délai d'inactivité : 1 heure (60 minutes * 60 secondes * 1000 ms)
const INACTIVITY_TIMEOUT = 3600 * 1000; 
const PUBLIC_PATHS = ["/", "/logout", "/loading", "/register-secret"];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("isAuthenticated");
    router.replace("/logout");
  }, [router]);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      if (!PUBLIC_PATHS.includes(pathname)) {
         router.replace("/");
      }
    }
    setIsLoading(false);
  }, [router, pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
    };

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });
    
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated || PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return null;
}
