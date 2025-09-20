"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  UserPlus,
  PackagePlus,
  ShoppingBag,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  submenu?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "New Order",
    href: "/",
    icon: FilePlus2,
  },
  {
    title: "Customers",
    href: "/customer",
    icon: Users,
    
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedItems([]);
    }
  };

  const toggleSubmenu = (title: string) => {
    if (isCollapsed) return;

    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, isSubmenuItem = false) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    // const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.href);

    return (
      <div key={item.title}>
        <Link
          href={item.href}
          onClick={() => hasSubmenu && toggleSubmenu(item.title)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
            active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent",
            isSubmenuItem && "ml-6 text-sm",
            isCollapsed && !isSubmenuItem && "justify-center px-2"
          )}
        >
          <item.icon
            className={cn("h-5 w-5 flex-shrink-0", isSubmenuItem && "h-4 w-4")}
          />

          {!isCollapsed && (
            <>
              <span className="flex-1 truncate">{item.title}</span>

              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}

              {/* {hasSubmenu && (
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              )} */}
            </>
          )}
        </Link>

        {/* Submenu */}
        {/* {hasSubmenu && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.submenu!.map((subItem) => renderNavItem(subItem, true))}
          </div>
        )} */}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">CRM System</h2>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      {/* {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>CRM System v1.0</p>
            <p>© 2025 Your Company</p>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Sidebar;
