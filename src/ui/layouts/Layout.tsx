// bg-[#0B61E0]

import * as React from "react";
import { Outlet } from "@tanstack/react-router";
import Navbar from "./navbar/Navbar";
import Header from "./header/Header";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Navbar isMobileMenuOpen={isMobileMenuOpen} onClose={handleClose} />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            onMobileMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
          />
          <main className="p-2 md:p-6">
            <Outlet />
          </main>
        </div>

        {/* Backdrop para cerrar el menú en móvil */}
        {isMobileMenuOpen && (
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
