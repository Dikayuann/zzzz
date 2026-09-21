import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/95 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-base group">
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[#0ea5e9] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Send className="h-4 w-4 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            CampaignBlast
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-[#0ea5e9] transition-colors">
            Cara Kerja
          </a>
          <a href="#harga" className="hover:text-[#0ea5e9] transition-colors">
            Harga
          </a>
          <a href="#faq" className="hover:text-[#0ea5e9] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Button: Hanya tombol Masuk */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button
              size="sm"
              className="h-9 px-5 text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg shadow-sm transition-all"
            >
              Masuk
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50 hover:text-[#0ea5e9]"
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50 hover:text-[#0ea5e9]"
            >
              Cara Kerja
            </a>
            <a
              href="#harga"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50 hover:text-[#0ea5e9]"
            >
              Harga
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50 hover:text-[#0ea5e9]"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold h-9 rounded-lg">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
