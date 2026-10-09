"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";

import Header from "@/components/Header";
import { getGuestBookings } from "@/lib/api";

interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;

  listing: {
    id: number;
    title: string;
    location: string;
    country: string;
    rating: number;
    price_per_night: number;
    images?: {
      id: number;
      url: string;
      position: number;
    }[];
  };
}

export default function TripsPage() {
  const [bookings, setBookings] = useState<Booking[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        // Demo guest from seed data
        const data = await getGuestBookings(4);

        setBookings(data);
      } catch (error) {
        console.error(
          "Failed to load trips:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  function formatDate(dateString: string) {
    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />

        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-gray-500">
            Loading your trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1100px] px-6 py-10">

        {/* Header */}
        <div className="mb-8">

          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft size={18} />
            Back to stays
          </Link>

          <h1 className="text-3xl font-semibold">
            My Trips
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your upcoming stays.
          </p>

        </div>

        {/* No bookings */}
        {bookings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">

            <CalendarDays
              size={48}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-xl font-semibold">
              No trips yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your confirmed bookings will appear here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-[#FF385C] px-6 py-3 font-semibold text-white hover:bg-[#E31C5F]"
            >
              Explore stays
            </Link>

          </div>
        ) : (
          <div className="space-y-6">

            {bookings.map((booking) => {

              const image =
                booking.listing?.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";

              return (
                <Link
                  key={booking.id}
                  href={`/listings/${booking.listing_id}`}
                  className="block"
                >
                  <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">

                    <div className="grid md:grid-cols-[280px_1fr]">

                      {/* Image */}
                      <div className="h-64 md:h-full">

                        <img
                          src={image}
                          alt={
                            booking.listing?.title ||
                            "Booked property"
                          }
                          className="h-full w-full object-cover"
                        />

                      </div>

                      {/* Details */}
                      <div className="p-6 md:p-8">

                        <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">

                          <div>

                            <p className="text-sm font-medium text-gray-500">
                              Confirmed stay
                            </p>

                            <h2 className="mt-1 text-2xl font-semibold">
                              {booking.listing?.title}
                            </h2>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">

                              <span className="flex items-center gap-1">
                                <MapPin size={16} />

                                {booking.listing?.location},{" "}
                                {booking.listing?.country}
                              </span>

                              <span className="flex items-center gap-1">
                                <Star
                                  size={15}
                                  fill="currentColor"
                                />

                                {booking.listing?.rating?.toFixed(
                                  2
                                )}
                              </span>

                            </div>

                          </div>

                          <div className="h-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                            {booking.status}
                          </div>

                        </div>

                        {/* Trip information */}
                        <div className="mt-7 grid gap-5 border-y py-6 sm:grid-cols-3">

                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-500">
                              Check-in
                            </p>

                            <p className="mt-1 font-medium">
                              {formatDate(
                                booking.check_in
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-500">
                              Check-out
                            </p>

                            <p className="mt-1 font-medium">
                              {formatDate(
                                booking.check_out
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-500">
                              Guests
                            </p>

                            <p className="mt-1 font-medium">
                              {booking.guests}{" "}
                              {booking.guests === 1
                                ? "guest"
                                : "guests"}
                            </p>
                          </div>

                        </div>

                        {/* Price */}
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                          <div>

                            <p className="text-sm text-gray-500">
                              {booking.nights}{" "}
                              {booking.nights === 1
                                ? "night"
                                : "nights"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              ₹
                              {booking.nightly_price.toLocaleString(
                                "en-IN"
                              )}{" "}
                              per night
                            </p>

                          </div>

                          <div className="text-left sm:text-right">

                            <p className="text-sm text-gray-500">
                              Total trip price
                            </p>

                            <p className="text-xl font-semibold">
                              ₹
                              {booking.total_price.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </article>
                </Link>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}