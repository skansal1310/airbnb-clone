"use client";

import { Listing } from "@/lib/types";
import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
}

export default function ListingGrid({
  listings,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="py-20 text-center">

        <h2 className="text-xl font-semibold">
          No stays found
        </h2>

        <p className="mt-2 text-gray-500">
          Try changing your search or category.
        </p>

      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-x-6 gap-y-10 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
        />
      ))}

    </div>
  );
}