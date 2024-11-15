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

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/branches", icon: Building2, label: "Branches" },
  { href: "/expenses", icon: DollarSign, label: "Expenses" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/suppliers", icon: Truck, label: "Suppliers" },
  { href: "/products", icon: Package2, label: "Products" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar() {
  const pathname = usePathname();
  const [view, setView] = useState<"retail" | "wholesale">("retail");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          className="flex flex-col bg-primary text-primary-foreground"
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
                value={view}
                onValueChange={(value) =>
                  setView(value as "retail" | "wholesale")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="retail"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Retail
                  </TabsTrigger>
                  <TabsTrigger
                    value="wholesale"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Wholesale
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {navItems.map(({ href, icon: Icon, label }) => (
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
                <Icon className="h-5 w-5" />
                {label}
              </Link>
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
                John Doe
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-primary-foreground/75">
            <p className="text-xs font-medium">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <span className="text-xs">•</span>
            <p className="text-xs font-medium tabular-nums">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">
                Administrator
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
