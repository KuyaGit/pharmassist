"use client";

import { cn } from "@/lib/utils";
import styles from "@/app/pharmassist-home/page.module.css";

interface ScrollHideWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollHideWrapper({
  children,
  className,
}: ScrollHideWrapperProps) {
  return (
    <div className={cn(styles.pharmassistHome, className)}>{children}</div>
  );
}
