"use client";

import { Heart, Star } from "lucide-react";
import { Listing } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from "next/link";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/lib/api";

interface ListingCardProps {
  listing: Listing;
}

const DEMO_USER_ID = 4;

export default function ListingCard({
  listing,
}: ListingCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const image =
    listing.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";

  // Check whether this listing is already saved
  useEffect(() => {
    async function checkFavorite() {
      try {
        const favorites =
          await getFavorites(DEMO_USER_ID);

        const exists = favorites.some(
          (item: {
            listing: {
              id: number;
            };
          }) =>
            item.listing.id === listing.id
        );

        setFavorite(exists);
      } catch (error) {
        console.error(
          "Failed to check favorite:",
          error
        );
      }
    }

    checkFavorite();
  }, [listing.id]);

  async function handleFavorite(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      if (favorite) {
        await removeFavorite(
          DEMO_USER_ID,
          listing.id
        );

        setFavorite(false);
      } else {
        await addFavorite(
          DEMO_USER_ID,
          listing.id
        );

        setFavorite(true);
      }
    } catch (error) {
      console.error(
        "Failed to update favorite:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <article className="group cursor-pointer">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl">

          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={saving}
            aria-label={
              favorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            className="absolute right-3 top-3 rounded-full p-2 text-white transition hover:scale-110 disabled:opacity-60"
          >
            <Heart
              size={24}
              fill={
                favorite
                  ? "#FF385C"
                  : "rgba(0,0,0,0.35)"
              }
              className={
                favorite
                  ? "text-[#FF385C]"
                  : "text-white"
              }
            />
          </button>

        </div>

        {/* Information */}
        <div className="mt-3">

          <div className="flex items-start justify-between gap-2">

            <h3 className="font-semibold text-gray-900">
              {listing.location},{" "}
              {listing.country}
            </h3>

            <div className="flex shrink-0 items-center gap-1">

              <Star
                size={14}
                fill="currentColor"
              />

              <span className="text-sm">
                {listing.rating.toFixed(2)}
              </span>

            </div>

          </div>

          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
            {listing.title}
          </p>

          <p className="mt-2 text-sm">
            <span className="font-semibold">
              ₹
              {listing.price_per_night.toLocaleString(
                "en-IN"
              )}
            </span>{" "}
            night
          </p>

        </div>

      </article>
    </Link>
  );
}