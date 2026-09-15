import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function BackofficeLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
