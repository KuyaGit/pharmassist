"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <ImageCarousel />
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-white/80 flex items-center justify-center">
            <Icons.logo width={28} height={28} className="dark:invert" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight">Pomona</h2>
            <p className="text-sm text-white/60">PharmAssist Mobile</p>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Download PharmAssist Mobile
            </h1>
            <p className="text-sm text-muted-foreground">
              Access your pharmacy management tools on the go
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <Button className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download APK
              </Button>
              <div className="text-sm text-muted-foreground mt-4">
                <p className="mb-2">Installation Instructions:</p>
                <ol className="text-left list-decimal list-inside space-y-1">
                  <li>Download the APK file</li>
                  <li>Enable "Install from Unknown Sources" in Settings</li>
                  <li>Open the downloaded APK file</li>
                  <li>Follow the installation prompts</li>
                </ol>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                <p>Need help? Contact support at</p>
                <a
                  href="mailto:support@pomona.com"
                  className="text-primary hover:underline"
                >
                  support@pomona.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
