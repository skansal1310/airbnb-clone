"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (location: string) => void;
}

export default function SearchBar({
  onSearch,
}: SearchBarProps) {
  const [location, setLocation] = useState("");

  return (
    <div className="mx-auto mt-6 flex max-w-4xl items-center rounded-full border bg-white p-2 shadow-lg">

      <div className="flex-1 border-r px-6">
        <p className="text-xs font-semibold">
          Where
        </p>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search destinations"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
        />
      </div>

      <div className="hidden flex-1 border-r px-6 md:block">
        <p className="text-xs font-semibold">
          Check in
        </p>

        <p className="text-sm text-gray-500">
          Add dates
        </p>
      </div>

      <div className="hidden flex-1 border-r px-6 md:block">
        <p className="text-xs font-semibold">
          Check out
        </p>

        <p className="text-sm text-gray-500">
          Add dates
        </p>
      </div>

      <div className="hidden flex-1 px-6 md:block">
        <p className="text-xs font-semibold">
          Guests
        </p>

        <p className="text-sm text-gray-500">
          Add guests
        </p>
      </div>

      <button
        onClick={() => onSearch(location)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF385C] text-white hover:bg-[#E31C5F]"
      >
        <Search size={20} />
      </button>

    </div>
  );
}