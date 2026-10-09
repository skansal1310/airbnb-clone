"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Star,
} from "lucide-react";

import Header from "@/components/Header";
import {
  getFavorites,
  removeFavorite,
} from "@/lib/api";

const DEMO_USER_ID = 4;

interface Favorite {
  favorite_id: number;

  listing: {
    id: number;
    title: string;
    location: string;
    country: string;
    price_per_night: number;
    rating: number;
    review_count: number;

    images?: {
      id: number;
      url: string;
      position: number;
    }[];
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadFavorites() {
    try {
      const data =
        await getFavorites(
          DEMO_USER_ID
        );

      setFavorites(data);
    } catch (error) {
      console.error(
        "Failed to load favorites:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function handleRemove(
    listingId: number
  ) {
    try {
      await removeFavorite(
        DEMO_USER_ID,
        listingId
      );

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite.listing.id !==
            listingId
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );
    }
  }

  return (
    <main className="min-h-screen bg-white">

      <Header />

      <div className="mx-auto max-w-[1200px] px-6 py-10">

        {/* Header */}
        <div className="mb-10">

          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft size={18} />
            Back to stays
          </Link>

          <div className="flex items-center gap-3">

            <Heart
              size={30}
              fill="#FF385C"
              className="text-[#FF385C]"
            />

            <h1 className="text-3xl font-semibold">
              Favorites
            </h1>

          </div>

          <p className="mt-2 text-gray-500">
            Places you've saved for later.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-gray-500">
              Loading favorites...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          favorites.length === 0 && (
            <div className="rounded-2xl border p-12 text-center">

              <Heart
                size={50}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-5 text-xl font-semibold">
                No favorites yet
              </h2>

              <p className="mt-2 text-gray-500">
                Save places you love and
                find them here.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-[#FF385C] px-6 py-3 font-semibold text-white hover:bg-[#E31C5F]"
              >
                Explore stays
              </Link>

            </div>
          )}

        {/* Favorites */}
        {!loading &&
          favorites.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {favorites.map(
                (favorite) => {

                  const listing =
                    favorite.listing;

                  const image =
                    listing.images?.[0]
                      ?.url ||
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";

                  return (
                    <article
                      key={
                        favorite.favorite_id
                      }
                      className="group"
                    >

                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden rounded-xl">

                        <Link
                          href={`/listings/${listing.id}`}
                        >
                          <img
                            src={image}
                            alt={
                              listing.title
                            }
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </Link>

                        {/* Remove */}
                        <button
                          onClick={() =>
                            handleRemove(
                              listing.id
                            )
                          }
                          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition hover:scale-110"
                          aria-label="Remove favorite"
                        >
                          <Heart
                            size={21}
                            fill="#FF385C"
                            className="text-[#FF385C]"
                          />
                        </button>

                      </div>

                      {/* Details */}
                      <Link
                        href={`/listings/${listing.id}`}
                      >
                        <div className="mt-3">

                          <div className="flex justify-between gap-2">

                            <h2 className="font-semibold">
                              {listing.location},{" "}
                              {listing.country}
                            </h2>

                            <span className="flex items-center gap-1 text-sm">
                              <Star
                                size={14}
                                fill="currentColor"
                              />

                              {listing.rating.toFixed(
                                2
                              )}
                            </span>

                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                            {listing.title}
                          </p>

                          <p className="mt-2 text-sm">
                            <strong>
                              ₹
                              {listing.price_per_night.toLocaleString(
                                "en-IN"
                              )}
                            </strong>{" "}
                            night
                          </p>

                        </div>
                      </Link>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>

    </main>
  );
}