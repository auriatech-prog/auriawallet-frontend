import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-auria-cream text-auria-ink md:bg-auria-page md:p-6">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-auria-cream md:max-w-110 md:rounded-[28px] md:border md:border-auria-border md:shadow-[0_20px_50px_rgba(14,56,40,0.12)]">
        <Navbar />
        <main className="flex-1 overflow-y-auto scroll-smooth px-5 pt-4 pb-16">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
