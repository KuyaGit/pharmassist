import { TimeRange } from "@/types/analytics";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTimeRangeDescription(timeRange: TimeRange) {
  switch (timeRange) {
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "1y":
      return "Last 12 months";
    default:
      return "Custom range";
  }
}

export function getMetricTitle(timeRange: TimeRange) {
  switch (timeRange) {
    case "7d":
      return "Weekly";
    case "30d":
      return "Monthly";
    case "90d":
      return "Quarterly";
    case "1y":
      return "Yearly";
    default:
      return "Custom";
  }
}
