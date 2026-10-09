"use client";

import { Globe, Menu, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6">
        
        <div className="text-3xl font-bold tracking-tight text-[#FF385C]">
          airbnb
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <button className="text-gray-900">
            Stays
          </button>

          <button className="text-gray-500 hover:text-gray-900">
            Experiences
          </button>

          <button className="text-gray-500 hover:text-gray-900">
            Online Experiences
          </button>
        </nav>

        <div className="flex items-center gap-3">
          
          <button className="hidden rounded-full px-4 py-3 text-sm font-medium hover:bg-gray-100 md:block">
            Airbnb your home
          </button>

          <button className="rounded-full p-3 hover:bg-gray-100">
            <Globe size={18} />
          </button>

          <button className="flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm hover:shadow-md">
            <Menu size={18} />
            <UserCircle size={24} />
          </button>

        </div>
      </div>
    </header>
  );
}