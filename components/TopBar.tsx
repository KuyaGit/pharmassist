"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Package2,
  Home,
  Building2,
  DollarSign,
  Package,
  FileText,
  Truck,
  Search,
  Menu,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientTime } from "@/components/ClientTime";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useView } from "@/lib/context/ViewContext";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

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
    ],
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar() {
  const pathname = usePathname();
  const { branchType, setBranchType } = useBranchTypeStore();
  const { user, isLoading } = useCurrentUser();

  const isBranchOperations =
    pathname.startsWith("/branches") || pathname.startsWith("/reports");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-primary text-primary-foreground px-4 lg:h-[60px] lg:px-6 shadow-md">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col bg-primary text-primary-foreground w-[80%] max-w-[300px] h-screen overflow-y-auto"
        >
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <img src="/icon.png" alt="Pomona Logo" className="h-6 w-6" />
              <span className="">POMONA Inc</span>
            </Link>
            <div className="py-2">
              <Tabs
                value={branchType}
                onValueChange={(value) =>
                  isBranchOperations &&
                  setBranchType(value as "retail" | "wholesale")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="retail" disabled={!isBranchOperations}>
                    Retail
                  </TabsTrigger>
                  <TabsTrigger value="wholesale" disabled={!isBranchOperations}>
                    Wholesale
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {navigationGroups.map((group, groupIndex) => (
              <div
                key={group.groupName}
                className={cn(
                  "py-2",
                  groupIndex !== 0 && "border-t border-primary-foreground/20"
                )}
              >
                <div className="px-3 py-2 text-xs uppercase text-primary-foreground/70">
                  {group.groupName}
                </div>
                {group.items.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 my-1 transition-all hover:bg-background hover:text-foreground",
                      pathname.startsWith(href)
                        ? "bg-background text-foreground font-semibold"
                        : "text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 items-center gap-4 text-primary-foreground">
        <div className="hidden md:flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold tracking-tight">
              {getGreeting()},
              <span className="ml-1.5 text-primary-foreground/85">
                {user?.full_name || "Loading..."}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-primary-foreground/75">
            <ClientTime />
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/avatars/01.png"
                  alt={user?.full_name || "User"}
                />
                <AvatarFallback>
                  {user?.full_name
                    ? `${user.full_name.split(" ")[0][0]}${
                        user.full_name.split(" ")[1]?.[0] || ""
                      }`
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || "Loading..."}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "loading..."}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
