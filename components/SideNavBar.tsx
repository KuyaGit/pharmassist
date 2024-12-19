"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Home,
  Building2,
  DollarSign,
  FileText,
  Truck,
  ChevronRight,
  ChevronLeft,
  Store,
  Warehouse,
  Package2,
  Users,
  Smartphone,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "./SidebarContext";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

type BranchType = "retail" | "wholesale";

export function SideNavBar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isInitialized } = useSidebar();
  const { branchType, setBranchType } = useBranchTypeStore();

  const isBranchOperations =
    pathname === "/dashboard" ||
    pathname.startsWith("/branches") ||
    pathname.startsWith("/reports") ||
    (pathname.startsWith("/products") && pathname.includes("/analytics"));

  if (!isInitialized) {
    return null;
  }

  const navigationGroups = [
    {
      groupName: "Overview",
      items: [{ href: "/dashboard", icon: Home, label: "Dashboard" }],
    },
    {
      groupName: "Branch Operations",
      items: [
        { href: "/branches", icon: Building2, label: "Branches" },
        { href: "/reports", icon: FileText, label: "Reports" },
      ],
    },
    {
      groupName: "Inventory",
      items: [
        { href: "/products", icon: Package2, label: "Products" },
        { href: "/suppliers", icon: Truck, label: "Suppliers" },
      ],
    },
    {
      groupName: "Management",
      items: [
        { href: "/users", icon: Users, label: "Users" },
        { href: "/expenses", icon: DollarSign, label: "Expenses" },
        {
          href: "/app-management",
          icon: Smartphone,
          label: "App Management",
          permission: ["admin"],
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "hidden top-0 left-0 z-40 bg-primary text-primary-foreground md:flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        isInitialized && "transition-all duration-300"
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center md:h-[60px]">
          <div className="flex items-center w-full">
            <div className="flex items-center gap-3 pl-3 pt-3">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center"
              >
                <Image
                  src="/icon.svg"
                  alt="Pomona Logo"
                  width={40}
                  height={40}
                  className="object-contain bg-white rounded-lg p-1"
                  priority
                  loading="eager"
                />
              </Link>
              <div
                className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                )}
              >
                <span className="font-semibold whitespace-nowrap flex flex-col">
                  <span className="flex items-center gap-2">
                    <span className="text-sm tracking-widest font-bold">
                      POMONA
                    </span>
                    <span className="text-sm font-medium opacity-70"></span>
                  </span>
                  <span className="text-base font-medium tracking-tight -mt-0.5">
                    PharmAssist
                  </span>
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "ml-auto transition-colors relative hover:bg-transparent",
                isCollapsed ? "h-[60px] w-16" : "h-[60px] w-12",
                "flex items-center justify-center",
                "before:absolute before:content-[''] before:-inset-y-2 before:-inset-x-1",
                "!hover:bg-transparent !hover:text-inherit"
              )}
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className={cn("px-2 py-2", isCollapsed && "flex justify-center")}>
          <Tabs
            value={branchType}
            onValueChange={(value) =>
              isBranchOperations && setBranchType(value as BranchType)
            }
            className={cn("w-full", isCollapsed && "flex flex-col")}
          >
            <TabsList
              className={cn(
                "w-full",
                isCollapsed ? "flex-col h-auto space-y-2" : "grid grid-cols-2",
                !isBranchOperations && ""
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <TabsTrigger
                        value="retail"
                        className={cn(
                          "flex items-center justify-center w-full",
                          isCollapsed && "p-2",
                          !isBranchOperations && ""
                        )}
                        disabled={!isBranchOperations}
                      >
                        {isCollapsed ? <Store className="h-4 w-4" /> : "Retail"}
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>
                        Retail
                        {!isBranchOperations &&
                          " (Only available in Branch Operations)"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <TabsTrigger
                        value="wholesale"
                        className={cn(
                          "flex items-center justify-center w-full",
                          isCollapsed && "p-2",
                          !isBranchOperations && ""
                        )}
                        disabled={!isBranchOperations}
                      >
                        {isCollapsed ? (
                          <Warehouse className="h-4 w-4" />
                        ) : (
                          "Wholesale"
                        )}
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>
                        Wholesale
                        {!isBranchOperations &&
                          " (Only available in Branch Operations)"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 transition-all duration-300 overflow-hidden text-sm font-medium md:px-4">
            <TooltipProvider>
              {navigationGroups.map((group, groupIndex) => (
                <div
                  key={group.groupName}
                  className={cn(
                    "py-2",
                    groupIndex !== 0 && "border-t border-primary-foreground/20"
                  )}
                >
                  {!isCollapsed && (
                    <div className="px-3 py-2 text-xs uppercase text-primary-foreground/70">
                      {group.groupName}
                    </div>
                  )}
                  {group.items.map(({ href, icon: Icon, label }) => (
                    <Tooltip key={href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 my-1 transition-all hover:bg-background hover:text-foreground",
                            pathname.startsWith(href)
                              ? "bg-background text-foreground font-semibold"
                              : "text-primary-foreground",
                            isCollapsed && "justify-center px-0"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {!isCollapsed && label}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          <p>{label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </TooltipProvider>
          </nav>
        </div>
      </div>
    </div>
  );
}
