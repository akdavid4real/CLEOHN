"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  LogOut,
  Settings,
  Tag,
  Home,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTheme } from "@/hooks/use-theme";

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: Tag,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Settings,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 flex flex-col h-screen border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logoicon.png"
              alt="CLEOHN"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CLEOHN</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer",
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-purple-700 dark:text-purple-400" : "text-gray-500 dark:text-gray-400")} />
                <span className="text-sm">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
            <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">View Site</span>
          </div>
        </Link>
        <div
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </div>
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
}
