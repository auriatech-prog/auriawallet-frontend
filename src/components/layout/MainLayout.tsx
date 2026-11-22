import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
  return (
    <div className="flex min-h-dvh justify-center bg-auria-cream text-auria-ink md:bg-auria-page md:p-6">
      <div className="relative flex min-h-dvh w-full flex-col bg-auria-cream md:min-h-[calc(100dvh-3rem)] md:max-w-110 md:overflow-hidden md:rounded-[28px] md:border md:border-auria-border md:shadow-[0_20px_50px_rgba(14,56,40,0.12)]">
        <Navbar />
        <main className="flex-1 px-5 pt-4 pb-22">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
