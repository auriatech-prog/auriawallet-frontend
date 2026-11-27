import { Outlet } from "react-router";
import { DesktopTopBar, Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-auria-cream text-auria-ink lg:h-dvh lg:flex-row lg:overflow-hidden lg:bg-auria-page">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">
        <DesktopTopBar />
        <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-5 pt-3 pb-28 lg:mx-auto lg:w-full lg:max-w-[1600px] lg:px-8 lg:pt-2 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
