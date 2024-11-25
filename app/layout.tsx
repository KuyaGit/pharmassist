import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { SidebarProvider } from "@/components/SidebarContext";
import "./loader.css";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { Toaster } from "@/components/ui/sonner";
import { ViewProvider } from "@/lib/context/ViewContext";

config.autoAddCss = false;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PharmAssist",
  description: "PharmAssist is an inventory management system made for POMONA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ViewProvider>
          <LoadingProvider>
            <SidebarProvider>
              <Providers attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
              </Providers>
            </SidebarProvider>
          </LoadingProvider>
        </ViewProvider>
      </body>
    </html>
  );
}
