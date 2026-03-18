
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthWrapper } from "@/components/auth-wrapper";
import { Button } from "@/components/ui/button";
import { LogOut, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.replace("/logout");
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header Haut-Droit */}
        <header className="fixed top-0 right-0 z-30 p-4 flex items-center gap-4 bg-transparent lg:pl-64 w-full justify-end">
            <button className="flex items-center gap-1 text-sm text-[#333] hover:underline">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span>Rate us</span>
            </button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-gray-300 rounded-sm text-sm"
            >
              Log out
            </Button>
        </header>

        <div className="flex flex-1 pt-16">
          <AppSidebar />
          
          <main className="flex-1 lg:ml-64 relative pb-32 min-h-screen">
            <div className="p-4 sm:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* Large Bande Orange Footer */}
        <footer className="lg:ml-64 bg-[#ff6200] text-white py-12 px-6 mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            <div className="flex gap-6 text-sm font-bold">
              <a href="#" className="hover:underline">Contact Us</a>
              <span className="opacity-50">|</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span className="opacity-50">|</span>
              <a href="#" className="hover:underline">Security</a>
            </div>
            <p className="text-xs opacity-80 text-center">
              © ING Bank (Australia) Limited ABN 24 000 893 292. Australian Credit Licence 224000 893 292.
            </p>
          </div>
        </footer>
      </div>
    </AuthWrapper>
  );
}
