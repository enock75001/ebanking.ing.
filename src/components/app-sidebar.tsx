"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  ArrowRightLeft,
  Settings,
  CreditCard,
  FileText,
  PlusCircle,
  Tag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const mainItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/accounts", label: "My accounts", icon: Wallet },
  { href: "/transfer", label: "Transfer & pay", icon: ArrowRightLeft },
  { href: "/manage-accounts", label: "Manage accounts", icon: Settings },
  { href: "/cards", label: "Manage cards", icon: CreditCard },
  { href: "/statements", label: "Statements", icon: FileText },
  { href: "/apply", label: "Apply for products", icon: PlusCircle },
  { href: "/offers", label: "My offers", icon: Tag },
];

const footerItems = [
  { href: "/profile", label: "My profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#333] text-white h-screen fixed left-0 top-0 z-40 hidden lg:flex flex-col">
      {/* Header avec Logo et Nom */}
      <div className="p-6 border-b border-white/5">
        <div className="flex flex-col items-start gap-4 mb-4">
          <div className="bg-[#ff6200] p-2 rounded-sm shadow-lg shadow-orange-500/20">
            <Image 
              src="https://i.imgur.com/WWZ10oQ.png" 
              alt="ING Logo" 
              width={80} 
              height={32} 
              className="brightness-0 invert object-contain"
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Client Premium</p>
            <p className="text-sm font-black tracking-tight truncate w-48">BERNARD BERLIN LEROY</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-200 text-sm font-medium group",
              pathname === item.href
                ? "bg-white text-[#ff6200] shadow-xl shadow-white/5"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", pathname === item.href ? "text-[#ff6200]" : "text-white/80")} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-white/10 space-y-1 bg-[#2a2a2a]">
        {footerItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
