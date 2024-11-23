import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="animate-pulse space-y-4">
            {/* Add skeleton UI here */}
          </div>
        </main>
      </div>
    </div>
  );
}
